// v0.97.0: 合言葉でデッキを保存(中継役を通す)・管理者は記録を見られる
import { page, ev, errs, browser } from '../head.mjs';
const o = {};
const posts = [];
let shared = [{ id: 'd1', name: '共有テスト', eggs: [], main: [{ number: 'BT1-010', count: 4 }] }];
let user = [];
await page.route('**/script.google.com/**', async (r) => {
  const req = r.request();
  if (req.method() === 'GET') return r.fulfill({ json: { ok: true, shared, user } });
  const b = JSON.parse(req.postData()); posts.push(b);
  if (b.pass !== 'ふつう' && b.pass !== 'かんり') return r.fulfill({ json: { ok: false, error: '合言葉が違います', code: 'pass' } });
  if (b.op === 'check') return r.fulfill({ json: { ok: true, admin: b.pass === 'かんり' } });
  if (b.op === 'log') return r.fulfill({ json: { ok: true, rows: [{ at: '2026/11/11 19:00:00', nick: 'たろう', op: 'デッキ削除', place: 'マイ', deck: '試作1', id: 'x' }] } });
  if (b.op === 'upsert') { const L = b.file === 'shared' ? shared : user; const i = L.findIndex(d => d.id === b.deck.id); if (i >= 0) L[i] = b.deck; else L.push(b.deck); }
  if (b.op === 'delete') { if (b.file === 'shared') shared = shared.filter(d => d.id !== b.id); else user = user.filter(d => d.id !== b.id); }
  return r.fulfill({ json: { ok: true } });
});
await page.waitForTimeout(800);
// トークンなし・合言葉なし → 書けない
await page.evaluate(() => { localStorage.removeItem('digica_gh_token'); localStorage.removeItem('digica_pass'); });
o.noWrite = await ev(`!canWriteSharedDecks()`);
// 合言葉をまちがえる
await page.evaluate(() => document.getElementById('openSettings').click());
await page.fill('#relayPass', 'ちがう'); await page.click('#relayPassCheck'); await page.waitForTimeout(400);
o.ng = await page.evaluate(() => /ちがい|違い/.test(document.getElementById('relayStatus').textContent) && !localStorage.getItem('digica_pass'));
// 管理者の合言葉
await page.fill('#relayPass', 'かんり'); await page.click('#relayPassCheck'); await page.waitForTimeout(600);
o.admin = await page.evaluate(() => /管理者/.test(document.getElementById('relayStatus').textContent) && localStorage.getItem('digica_pass_admin') === '1');
o.write = await ev(`canWriteSharedDecks() && canUseUserDecks()`);
await page.click('#relayOpenLog'); await page.waitForTimeout(400);
o.log = await page.evaluate(() => /たろう/.test(document.getElementById('relayLogBody').textContent));
await page.click('#relayLogClose'); await page.evaluate(() => document.getElementById('settingsModal').classList.remove('open'));
// 共有デッキの読み込みは中継役から
await ev(`refreshMyDeckList()`); await page.waitForTimeout(400);
o.read = await ev(`cachedDecks.some(d => d.name === '共有テスト' && d._src === 'shared')`);
// マイデッキに保存 → upsert(user)
await ev(`(async () => { const obj = deckObjFrom({ name: '保存テスト', author: 'テスト', eggs: [], main: [{ number: 'BT1-010', count: 4 }] }, newDeckId('user')); await writeDeck('user', obj, 'デッキ保存(マイ)'); })()`);
await page.waitForTimeout(300);
const up = posts.find(p => p.op === 'upsert');
o.upsert = !!up && up.file === 'user' && up.nickname === 'テスト' && up.pass === 'かんり' && up.deck.name === '保存テスト' && up.label === 'デッキ保存(マイ)';
// 削除 → delete
await ev(`removeRemoteDeck('shared', 'd1', '共有テスト', 'デッキ削除')`); await page.waitForTimeout(300);
o.del = posts.some(p => p.op === 'delete' && p.file === 'shared' && p.id === 'd1') && !shared.length;
// 通常の合言葉では記録は見られない(管理者のしるしが消える)
await ev(`DigicaRelay.check('ふつう')`); await page.waitForTimeout(400);
o.normal = await page.evaluate(() => localStorage.getItem('digica_pass') === 'ふつう' && localStorage.getItem('digica_pass_admin') !== '1');
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
