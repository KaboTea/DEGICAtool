// EX8-012「≪1ドロー≫し、自分の手札1枚を破棄する」の破棄ボタン / BT18-042「置いたカードと同じLv.の相手のデジモン全てを消滅」
// BT18-042の進化条件「特徴に「ハイブリッド体」を持つカードが下に5枚ある「源輝二」」(ハイブリッド体は形態の欄)
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const trig = (timing) => `(() => { const st=practiceState.players[${pi}].battle[0]; const tr=collectStackTriggers(st, ${pi}, 'battle', ['${timing}'], {event:'t'})[0]; window.__e=tr; return tr; })()`;
// 1 EX8-012: 手札1枚を破棄
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-014','EX8-012']}]; P.hand=['BT1-020','BT1-021']; P.trash=[]; renderPracticeBoard(); })()`); await settle();
await ev(trig('進化時'));
o.discardBtn = await ev(`effectHandlersWithConds(window.__e).handlers.some(h=>/手札.*1枚.*破棄/.test(h.label))`);
await ev(`effectHandlersWithConds(window.__e).handlers.find(h=>/手札.*1枚.*破棄/.test(h.label)).run()`); await page.waitForTimeout(150);
await page.evaluate(() => document.querySelector('#detailBody .cmp-row').click()); await page.waitForTimeout(80);
await page.evaluate(() => [...document.querySelectorAll('#detailBody button')].find(x=>/破棄する/.test(x.textContent) && !x.disabled).click()); await page.waitForTimeout(150);
o.discarded = await ev(`(() => { const P=practiceState.players[${pi}]; return P.hand.length===1 && P.trash.length===1; })()`);
// 2 BT18-042: 進化元のLv.5をセキュリティの下へ → 相手のLv.5だけ消滅の対象
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-014','BT1-020','BT18-042']}]; O.battle=[{cards:['BT1-015']},{cards:['BT1-021']}]; renderPracticeBoard(); })()`); await settle();
await ev(trig('進化時'));
await ev(`effectHandlersWithConds(window.__e).handlers.find(h=>/代償/.test(h.label)).run()`); await page.waitForTimeout(150);
await page.evaluate(() => { const r=[...document.querySelectorAll('#detailBody .cmp-row')].find(x=>/グラウンドラモン/.test(x.textContent)); r && r.click(); }); await page.waitForTimeout(80);
await page.evaluate(() => { const b=[...document.querySelectorAll('#detailBody .cmp-actions button, #detailBody button')].find(x=>/置く|セキュリティ/.test(x.textContent) && !x.disabled); b && b.click(); }); await page.waitForTimeout(200);
o.moved = await ev(`JSON.stringify(window.__e.costMovedNums)`);
o.label = await ev(`effectHandlersWithConds(window.__e).handlers.map(h=>h.label).join('|')`);
o.lvLabel = /Lv\.5の相手のデジモン全てを消滅/.test(o.label);
await ev(`effectHandlersWithConds(window.__e).handlers.find(h=>/消滅/.test(h.label)).run()`); await page.waitForTimeout(250);
if (await ev('!!fieldPickMode')) { o.pickCands = await ev(`fieldPickMode.candidates.map(st=>getStackTopCard(st).number).join()`); }
o.destroyBar = await bar();
o.onlyLv5 = /メタルグレイモン/.test(o.destroyBar) && !/グレイモン」が消滅/.test(o.destroyBar.replace(/メタルグレイモン/g, ''));
// 3 進化条件: 下にハイブリッド体5枚の「源輝二」は可、4枚は不可
o.evo = await ev(`(() => { const tam=[...cardIndexByNumber.values()].find(c=>c.name==='源輝二'); const hy=[...cardIndexByNumber.values()].filter(c=>/ハイブリッド体/.test(c.form||'')).slice(0,5).map(c=>c.number);
  const r=buildEvolveRoutes(cardIndexByNumber.get('BT18-042'), tam).find(x=>/ハイブリッド体/.test(x.sub||''));
  return [evaluateSpecialCondition(r.sub, tam, {cards:[...hy, tam.number]}), evaluateSpecialCondition(r.sub, tam, {cards:[...hy.slice(1), tam.number]})].join(); })()`);
o.evoOk = o.evo === 'true,false';
const ng = Object.entries(o).filter(([k, x]) => ['discardBtn','discarded','lvLabel','onlyLv5','evoOk'].includes(k) && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
