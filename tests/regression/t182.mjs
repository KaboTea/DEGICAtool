// v0.97.9: 「自分のセキュリティを全て確認する。その中の〜カード1枚を手札に加えられる。加えたなら、≪リカバリー+1《デッキ》≫。その後、シャッフル」(BT18-037 / P-122)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const hy = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.form==='ハイブリッド体' && c.number!=='BT18-037').number`);
const plain = 'BT1-010';
const run = (num, cond) => ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['${num}']}]; P.hand=[]; P.library=['BT1-001','BT1-002'];
  P.security=${cond}; renderPracticeBoard(); const c=cardIndexByNumber.get('${num}'); const line=c.effect.split('\\n').find(l=>/セキュリティを全て確認/.test(l));
  const h=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:1, text:line, timing:'x', event:'t'}).find(h=>/手札に加える/.test(h.label));
  if (!h) return 'nohandler'; h.run(); return 'ok'; })()`);
// 1 BT18-037: 条件に合うカードを加える → リカバリー1 → シャッフル(全部裏)
o.h1 = await run('BT18-037', `['${plain}', {n:'${hy}', u:1}, '${plain}']`);
o.okRows = await ev(`[...document.querySelectorAll('#detailBody .eep-go')].length === 1`);
await page.evaluate(() => document.querySelector('#detailBody .eep-go').click());
await page.waitForTimeout(200);
o.added = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; return P.hand.length===1 && P.hand[0]==='${hy}' && P.security.length===3 && P.library.length===1 && P.security.every(x=>typeof x==='string') && P.security.includes('BT1-001'); })()`);
// 2 加えない → リカバリーなし、シャッフルはする
o.h2 = await run('BT18-037', `['${plain}', {n:'${hy}', u:1}]`);
await page.evaluate(() => document.querySelector('#detailBody .eep-cancel').click());
await page.waitForTimeout(200);
o.declined = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; return P.hand.length===0 && P.security.length===2 && P.library.length===2 && P.security.every(x=>typeof x==='string'); })()`);
// 3 P-122: 黄/黒を含む2色以上
o.h3 = await run('P-122', `['${plain}']`);
o.p122none = await ev(`/合うカードがありません/.test(document.body.innerText)`);
const ng = Object.entries(o).filter(([k, x]) => x !== true && x !== 'ok').map(([k]) => k);
console.log(JSON.stringify(o), hy);
await browser.close(); console.log(ng.length ? ng : errs);
