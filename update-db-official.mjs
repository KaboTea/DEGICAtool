// 公式カードリスト(digimoncard.com)から、cards/db.json にまだ無いカードを追加するスクリプト。
// GitHub Actions(.github/workflows/update-db.yml)から定期実行する想定。
//
// ・既存のカード(heroi.cc由来など)は一切書き換えない。足りない番号だけを追加する。
// ・パラレル版は追加しない(同じ番号の通常版があれば十分なため)。
// ・一度チェックし終えた商品(カテゴリ)は cards/official-sync.json に記録し、次回からは
//   「未チェックの商品」「プロモ系」「各シリーズの最新2商品」だけを見に行く(公式サイトへの負荷を抑える)。
//   FULL_SCAN=1 のときは全商品を見直す。
//
// 使い方(ローカル): npm install --no-save cheerio@1.0.0 && node scripts/update-db-official.mjs
import fs from 'node:fs';
import * as cheerio from 'cheerio';

const BASE = process.env.OFFICIAL_BASE || 'https://digimoncard.com';
const DB_PATH = process.env.DB_PATH || 'cards/db.json';
const STATE_PATH = process.env.STATE_PATH || 'cards/official-sync.json';
const FULL_SCAN = process.env.FULL_SCAN === '1';
const DRY_RUN = process.env.DRY_RUN === '1';
const WAIT_MS = parseInt(process.env.WAIT_MS || '1500', 10);
const UA = 'DEGICAtool-db-sync/1.0 (+https://github.com/KaboTea/DEGICAtool)';
// プロモ系(プロモーションカード/公式大会景品/店舗イベント景品/プレミアムバンダイ・イベント物販/その他物販)は毎回見る
const ALWAYS_CHECK = /^5039\d\d$/;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function get(url) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ja,en;q=0.5' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (/Just a moment|cf-browser-verification|Attention Required/i.test(text.slice(0, 3000))) throw new Error('ボット確認ページが返されました');
      return text;
    } catch (e) {
      lastErr = e;
      await sleep(3000 * (i + 1));
    }
  }
  throw new Error(`${url} の取得に失敗: ${lastErr && lastErr.message}`);
}

// ---------- HTML → カード情報(ブラウザで動作確認済みの抽出ロジックを移植) ----------
function decode(html) {
  const stripped = (html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  return cheerio.load(stripped, null, false).text();
}
function clean(s) {
  return (s || '').replace(/\r/g, '').replace(/：/g, ':').replace(/＆/g, '&').replace(/＋/g, '+').replace(/－/g, '-').split('\n').map(x => x.trim()).filter(Boolean).join('\n');
}
function extract($) {
  return $('li.image_lists_item').map((_, li) => {
    const $li = $(li);
    const q = (sel) => $li.find(sel).first();
    const o = {
      no: q('.cardNo').text().trim(),
      rarity: q('.cardRarity').text().trim() || null,
      type: q('.cardType').text().trim(),
      lv: q('.cardLv').text().trim() || null,
      name: q('.cardTitle').text().trim(),
      parallel: /パラレル/.test(q('.cardTitleList').text()),
      img: q('.card_img img').attr('src') || null,
    };
    const info = {};
    const html = {};
    $li.find('.cardInfoCol > .cardInfoBox').each((_, box) => {
      const $b = $(box);
      const med = $b.children('.cardInfoTitMedium');
      if (med.length) {
        $b.find('dl.cardInfoBoxSmall').each((_, dl) => {
          const k = med.first().text().trim() + $(dl).find('dt').first().text().trim();
          const dd = $(dl).find('dd').first();
          info[k] = clean(decode(dd.html()));
          html[k] = dd.html() || '';
        });
      } else {
        const dt = $b.children('dt').first();
        const dd = $b.children('dd').first();
        if (dt.length && dd.length) {
          const k = dt.text().trim();
          info[k] = k === '入手情報' ? $(dd.contents().get(0)).text().trim() : clean(decode(dd.html()));
          html[k] = dd.html() || '';
        }
      }
    });
    o.info = info;
    o.html = html;
    return o;
  }).get();
}

const COL_ALL = ['black', 'blue', 'green', 'purple', 'red', 'white', 'yellow'];
const FORM = { 並: 'standard', 超: 'super', 極: 'ultimate', 神: 'god' };
const KNOWN_KEYS = ['色', '形態', '属性', 'タイプ', 'コスト', 'DP', '入手情報', '上段テキスト[効果]', '上段テキスト[特殊進化]', '上段テキスト[特殊登場]',
  '下段テキスト[セキュリティ効果]', '下段テキスト[進化元効果]', '下段テキスト[リンクDP]', '下段テキスト[リンク条件]', '下段テキスト[リンク中効果]',
  'デュアル使用コスト', 'デュアル条件色', '下段テキスト[デュアルルール]', '下段テキスト[デュアル効果]'];
const colorClasses = (h) => [...(h || '').matchAll(/cardColor_(\w+)/g)].map(m => m[1]).filter(Boolean);
const num = (v) => (v == null || v === '' || v === '-' || v === 'ー') ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10));

function toDb(c, pageUrl) {
  const info = c.info;
  const colors = colorClasses(c.html['色']).filter(x => COL_ALL.includes(x));
  const cat = { 'デジタマ': 'digi-egg', 'デジモン': 'digimon', 'テイマー': 'tamer', 'オプション': 'option', 'デジモン/オプション': 'digimon' }[c.type] || c.type;
  const lines = [];
  const sp = info['上段テキスト[特殊進化]'];
  if (sp) {
    sp.split('〔').filter(s => s.trim()).forEach(seg => {
      const m = /^([^〕]+)〕([\s\S]*)$/.exec(seg);
      if (!m) { lines.push(seg.trim()); return; }
      if (m[1] === '進化' || m[1] === 'ジョグレス') lines.push(`【${m[1]}】${m[2].trim()}`);
      else lines.push(`〔${m[1]}〕${m[2].trim().replace(/＆/g, '&')}`);
    });
  }
  if (info['上段テキスト[効果]']) lines.push(info['上段テキスト[効果]']);
  if (info['上段テキスト[特殊登場]']) {
    info['上段テキスト[特殊登場]'].split('\n').forEach(s => {
      const m = /^(\S+?-\d+):([\s\S]*)$/.exec(s.trim());
      if (!m) { lines.push(s.trim()); return; }
      if (/^デジクロス/.test(m[1])) lines.push(`≪≪${m[1]}≫≫:${m[2].trim()}`);
      else lines.push(`【${m[1]}】${m[2].trim()}`);
    });
  }
  Object.keys(info).filter(k => k.startsWith('上段テキスト[') && !['上段テキスト[効果]', '上段テキスト[特殊進化]', '上段テキスト[特殊登場]'].includes(k)).forEach(k => lines.push(info[k]));
  const evo = Object.keys(info).filter(k => /^進化条件\d+$/.test(k)).map(k => {
    const cols = colorClasses(c.html[k]);
    const txt = info[k].replace(/\s+/g, ' ');
    const color = cols.includes('all') ? COL_ALL.slice() : cols.filter(x => COL_ALL.includes(x));
    let m = /Lv\.(\d+)から(\d+)/.exec(txt);
    if (m) return { level: parseInt(m[1], 10), category: 'digimon', color, cost: parseInt(m[2], 10) };
    m = /(並|超|極|神)から(\d+)/.exec(txt);
    if (m) return { category: 'digimon', form: FORM[m[1]], color, cost: parseInt(m[2], 10) };
    m = /テイマーから(\d+)/.exec(txt);
    if (m) return { category: 'tamer', color, cost: parseInt(m[1], 10) };
    return { raw: txt, color };
  });
  const sec = info['下段テキスト[セキュリティ効果]'];
  const inh = [info['下段テキスト[リンクDP]'], info['下段テキスト[リンク条件]'], info['下段テキスト[リンク中効果]'], info['下段テキスト[進化元効果]']].filter(Boolean).join('\n');
  const lvm = /Lv\.(\d+)/.exec(c.lv || '');
  const d = {
    number: c.no, name: (c.name || '').replace(/：/g, ':').replace(/＆/g, '&'), category: cat, level: lvm ? parseInt(lvm[1], 10) : null, color: colors,
    play_cost: num(info['コスト']), dp: num(info['DP']), form: info['形態'] || null, attribute: info['属性'] || null, type: info['タイプ'] || null,
    rarity: c.rarity || null, block: null, effect: lines.join('\n') || null,
    security_effect: sec ? (/^【セキュリティ】/.test(sec) ? sec : '【セキュリティ】' + sec) : null,
    inherited: inh || null, evo,
    img: c.img ? new URL(c.img.replace(/\?.*$/, ''), pageUrl).href : null, dual: null,
  };
  if (c.type === 'デジモン/オプション') {
    d.dual = { use_cost: num(info['デュアル使用コスト']), effect: [info['下段テキスト[デュアルルール]'], info['下段テキスト[デュアル効果]']].filter(Boolean).join('\n'), color: colorClasses(c.html['デュアル条件色']), rarity: c.rarity || null, name: null };
  }
  // 既存データ(heroi.cc)の書式に合わせる
  const fixSec = (t) => t && t.replace(/^\{セキュリティ\}/gm, '［セキュリティ］');
  d.effect = fixSec(d.effect);
  d.inherited = fixSec(d.inherited);
  for (const k of ['effect', 'security_effect', 'inherited']) if (typeof d[k] === 'string' && /^[\s\-ー－]*$/.test(d[k])) d[k] = null;
  if (d.dual && d.dual.effect) {
    const ls = d.dual.effect.split('\n');
    const arts = ls.filter(l => /^≪アーツ進化≫/.test(l)).map(l => l.replace(/^≪アーツ進化≫/, '【アーツ進化】'));
    d.dual.effect = [...ls.filter(l => !/^≪アーツ進化≫/.test(l)), ...arts].join('\n');
  }
  const unknown = Object.keys(info).filter(k => !KNOWN_KEYS.includes(k) && !/^進化条件\d+$/.test(k));
  return { card: d, unknown, rawEvo: evo.some(e => e.raw) };
}

function parseCategories($) {
  const seen = new Map();
  $('option').each((_, o) => {
    const v = ($(o).attr('value') || '').trim();
    if (/^50\d{4}$/.test(v) && !seen.has(v)) seen.set(v, $(o).text().trim());
  });
  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

async function main() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const have = new Set(db.cards.map(c => c.number));
  let state = { done: [], lastRun: null };
  try { state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch (e) { /* 初回 */ }
  const done = new Set(state.done || []);

  const firstUrl = `${BASE}/cards/?search=true&category=503001`;
  const top$ = cheerio.load(await get(firstUrl));
  const cats = parseCategories(top$);
  if (!cats.length) throw new Error('商品(カテゴリ)一覧が見つかりませんでした。公式サイトの構造が変わった可能性があります');

  // 各シリーズ(上4桁+1桁: 5030=ブースター, 5031=スタート, 5032=リミテッド …)の最新2商品は毎回見る
  const newestByFamily = new Map();
  cats.forEach(c => {
    const fam = c.id.slice(0, 4);
    const list = newestByFamily.get(fam) || [];
    list.push(c.id);
    newestByFamily.set(fam, list);
  });
  const newest = new Set();
  newestByFamily.forEach(list => list.sort().slice(-2).forEach(id => newest.add(id)));

  const targets = cats.filter(c => FULL_SCAN || !done.has(c.id) || ALWAYS_CHECK.test(c.id) || newest.has(c.id));
  console.log(`商品 ${cats.length}件中 ${targets.length}件をチェックします${FULL_SCAN ? '(全件)' : ''}`);

  const added = [];
  const warnings = [];
  let fetched = 0;
  for (const c of targets) {
    const url = `${BASE}/cards/?search=true&category=${c.id}`;
    let html;
    try {
      html = await get(url);
    } catch (e) {
      warnings.push(`${c.name}: ${e.message}`);
      continue;
    }
    fetched++;
    const $ = cheerio.load(html);
    const items = extract($);
    if (!items.length) warnings.push(`${c.name}: カードが0件でした(構造変更の可能性)`);
    let newInCat = 0;
    for (const it of items) {
      if (!it.no || it.parallel || have.has(it.no)) continue;
      const { card, unknown, rawEvo } = toDb(it, url);
      if (unknown.length) warnings.push(`${card.number}: 未対応の項目 ${unknown.join(', ')}`);
      if (rawEvo) warnings.push(`${card.number}: 進化条件を読み取れませんでした`);
      added.push(card);
      have.add(card.number);
      newInCat++;
    }
    console.log(`- ${c.name}: ${items.length}件中 新規${newInCat}件`);
    if (!ALWAYS_CHECK.test(c.id)) done.add(c.id);
    await sleep(WAIT_MS);
  }
  if (fetched === 0) throw new Error('公式サイトのページを1つも取得できませんでした');

  warnings.forEach(w => console.log(`⚠ ${w}`));
  console.log(`追加: ${added.length}枚${added.length ? ' (' + added.map(c => c.number).join(', ') + ')' : ''}`);

  const today = new Date().toISOString().slice(0, 10);
  if (added.length && !DRY_RUN) {
    db.cards.push(...added);
    db.generated_at = today;
    if (!/digimoncard\.com/.test(db.source || '')) db.source = `${db.source || ''} + digimoncard.com`;
    fs.writeFileSync(DB_PATH, JSON.stringify(db));
  }
  // チェック記録は「チェック済みの商品が増えた」か「カードを追加した」ときだけ書き換える(毎週の無駄なコミットを避ける)
  const doneChanged = [...done].sort().join(',') !== [...(state.done || [])].sort().join(',');
  if (!DRY_RUN && (doneChanged || added.length)) {
    fs.writeFileSync(STATE_PATH, JSON.stringify({ done: [...done].sort(), lastChanged: today, lastAdded: added.map(c => c.number) }, null, 1) + '\n');
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [`## 公式サイトからのDB更新`, `- チェックした商品: ${fetched}件`, `- 追加したカード: ${added.length}枚`];
    if (added.length) lines.push('', added.map(c => `- ${c.number} ${c.name}`).join('\n'));
    if (warnings.length) lines.push('', '### 注意', warnings.map(w => `- ${w}`).join('\n'));
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
  }
}

main().catch(e => { console.error(`エラー: ${e.message}`); process.exit(1); });
