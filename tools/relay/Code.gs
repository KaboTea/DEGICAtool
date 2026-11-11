/**
 * DEGICAtool デッキ保存の中継役(Google Apps Script)
 *
 * ・アプリから「合言葉・ニックネーム・デッキ」を受け取り、GitHubのデッキファイルを書きかえる。
 * ・GitHubのトークンは「スクリプト プロパティ」にだけ置く(アプリにもGitHubにも出ない)。
 * ・書けるのは decks/decks.json(共有デッキ)と decks/users/<ニックネーム>.json(マイデッキ)だけ。
 * ・保存/削除のたびに、このスプレッドシートの「記録」シートに1行ふやす(GitHubには名前を残さない)。
 * ・管理者の合言葉なら、アプリから「記録」を見られる。
 *
 * スクリプト プロパティ(⚙プロジェクトの設定 → スクリプト プロパティ):
 *   GITHUB_TOKEN     … GitHubのトークン(このリポジトリの Contents: Read and write だけ)
 *   PASSPHRASE       … 仲間に伝える合言葉(保存・削除ができる)
 *   ADMIN_PASSPHRASE … 管理者の合言葉(保存・削除に加えて、記録を見られる)
 */
const REPO = 'KaboTea/DEGICAtool';
const BRANCH = 'main';
const SHARED_PATH = 'decks/decks.json';
const LOG_SHEET = '記録';
const MAX_DECKS_PER_FILE = 300;

function doGet(e) {
  // デッキ一覧の読み込み(合言葉なし。どちらも公開リポジトリのファイルなので誰でも見られる中身)
  try {
    const p = (e && e.parameter) || {};
    if (p.op === 'ping') return out_({ ok: true });
    const res = { ok: true, shared: readDecks_(SHARED_PATH).data.decks };
    if (p.nick) res.user = readDecks_(userPath_(p.nick)).data.decks;
    return out_(res);
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: '送られてきた内容が読めません' }); }
  const props = PropertiesService.getScriptProperties();
  const pass = props.getProperty('PASSPHRASE') || '';
  const admin = props.getProperty('ADMIN_PASSPHRASE') || '';
  const isAdmin = !!admin && req.pass === admin;
  if (!isAdmin && (!pass || req.pass !== pass)) return out_({ ok: false, error: '合言葉が違います', code: 'pass' });
  if (req.op === 'check') return out_({ ok: true, admin: isAdmin });
  if (req.op === 'log') {
    if (!isAdmin) return out_({ ok: false, error: '記録は管理者の合言葉でだけ見られます', code: 'admin' });
    return out_({ ok: true, rows: readLog_(Math.min(parseInt(req.limit, 10) || 200, 1000)) });
  }
  const nick = String(req.nickname || '').trim().slice(0, 40);
  if (!nick) return out_({ ok: false, error: 'ニックネームがありません' });
  if (req.file !== 'shared' && req.file !== 'user') return out_({ ok: false, error: '保存先が正しくありません' });
  const path = req.file === 'shared' ? SHARED_PATH : userPath_(nick);
  const label = String(req.label || (req.op === 'delete' ? 'デッキ削除' : 'デッキ保存')).slice(0, 40);

  let deck = null;
  if (req.op === 'upsert') {
    deck = cleanDeck_(req.deck);
    if (!deck) return out_({ ok: false, error: 'デッキの中身が正しくありません' });
  } else if (req.op === 'delete') {
    if (!req.id || String(req.id).length > 80) return out_({ ok: false, error: '削除するデッキが指定されていません' });
  } else {
    return out_({ ok: false, error: '知らない操作です' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let deckName = deck ? deck.name : '';
    for (let attempt = 0; attempt < 2; attempt++) {
      const cur = readDecks_(path);
      const decks = (cur.data.decks || []);
      if (req.op === 'upsert') {
        const i = decks.findIndex(d => d.id === deck.id);
        if (i >= 0) decks[i] = deck; else decks.push(deck);
        if (decks.length > MAX_DECKS_PER_FILE) return out_({ ok: false, error: 'デッキの数が多すぎます' });
      } else {
        const hit = decks.find(d => d.id === String(req.id));
        deckName = hit ? hit.name : String(req.name || req.id);
        cur.data.decks = decks.filter(d => d.id !== String(req.id));
      }
      if (req.op === 'upsert') cur.data.decks = decks;
      const msg = `${label}: ${deckName}`; // 誰がやったかは非公開の記録シートにだけ残す
      const put = writeFile_(path, JSON.stringify(cur.data), msg, cur.sha);
      if (put === 'conflict' && attempt === 0) continue;
      if (put !== 'ok') throw new Error('GitHubへの保存に失敗しました: ' + put);
      log_(nick, label, req.file === 'shared' ? '共有' : 'マイ', deckName, req.op === 'upsert' ? deck.id : String(req.id));
      return out_({ ok: true });
    }
    throw new Error('ほかの人と同時に保存したため、保存できませんでした。もう一度ためしてください');
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// アプリと同じ決まりで、ニックネームからマイデッキのファイル名を作る
function userPath_(nick) {
  const safe = String(nick || '').replace(/[\\/:*?"<>|#%\s.]+/g, '_').slice(0, 40) || 'user';
  return `decks/users/${safe}.json`;
}

// デッキの形と大きさを確かめて、余計なものを落とす
function cleanDeck_(d) {
  if (!d || typeof d !== 'object') return null;
  const id = String(d.id || '');
  if (!id || id.length > 80) return null;
  const list = (a) => {
    if (!Array.isArray(a) || a.length > 80) return null;
    const r = [];
    for (const x of a) {
      const n = String(x && x.number || '');
      const c = parseInt(x && x.count, 10);
      if (!n || n.length > 24 || !(c >= 1 && c <= 60)) return null;
      r.push({ number: n, count: c });
    }
    return r;
  };
  const eggs = list(d.eggs || []), main = list(d.main || []);
  if (!eggs || !main) return null;
  const o = { id, name: String(d.name || '無題のデッキ').slice(0, 60) };
  if (d.author) o.author = String(d.author).slice(0, 40);
  o.updated = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  o.eggs = eggs; o.main = main;
  return o;
}

function gh_(method, path, body) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('中継役にGitHubのトークンが設定されていません');
  const opt = {
    method, muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
  };
  if (body) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(body); }
  const url = `https://api.github.com/repos/${REPO}/contents/${encodeURI(path)}` + (method === 'get' ? `?ref=${BRANCH}` : '');
  return UrlFetchApp.fetch(url, opt);
}

function readDecks_(path) {
  const r = gh_('get', path);
  if (r.getResponseCode() === 404) return { data: { decks: [] }, sha: undefined };
  if (r.getResponseCode() !== 200) throw new Error('GitHubから読めませんでした: ' + r.getResponseCode());
  const j = JSON.parse(r.getContentText());
  const text = Utilities.newBlob(Utilities.base64Decode(String(j.content).replace(/\n/g, ''))).getDataAsString('UTF-8');
  let data;
  try { data = JSON.parse(text); } catch (e) { data = { decks: [] }; }
  if (!Array.isArray(data.decks)) data.decks = [];
  return { data, sha: j.sha };
}

function writeFile_(path, text, message, sha) {
  const body = { message, branch: BRANCH, content: Utilities.base64Encode(text, Utilities.Charset.UTF_8) };
  if (sha) body.sha = sha;
  const r = gh_('put', path, body);
  const code = r.getResponseCode();
  if (code === 200 || code === 201) return 'ok';
  if (code === 409 || code === 422) return 'conflict';
  return code + ' ' + r.getContentText().slice(0, 200);
}

function log_(nick, label, place, deckName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(LOG_SHEET);
  if (!sh) { sh = ss.insertSheet(LOG_SHEET); sh.appendRow(['日時', 'ニックネーム', '操作', '場所', 'デッキ名', 'デッキID']); sh.setFrozenRows(1); }
  sh.appendRow([Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'), nick, label, place, deckName, id]);
}

// 記録シートの新しい順に limit 行
function readLog_(limit) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const n = Math.min(limit, sh.getLastRow() - 1);
  const vals = sh.getRange(sh.getLastRow() - n + 1, 1, n, 6).getDisplayValues();
  return vals.reverse().map(v => ({ at: v[0], nick: v[1], op: v[2], place: v[3], deck: v[4], id: v[5] }));
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 動作確認用: エディタでこの関数を選んで▶実行すると、GitHubの共有デッキが読めるか試せる
function testRead() {
  const r = readDecks_(SHARED_PATH);
  Logger.log('共有デッキ ' + r.data.decks.length + '個 / sha=' + r.sha);
}
