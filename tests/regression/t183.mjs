// v0.97.10: 「自分のトラッシュから、「ヴォルフモン」と「ガルムモン」1枚ずつを自分の「源輝二」1体の下に置くことで」(BT17-026): テイマーを置き先に選べる
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
o.labels = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT1-010']},{cards:['BT17-083']}]; P.hand=['BT17-026']; P.trash=['BT17-022','BT17-023']; practiceState.memory=5; renderPracticeBoard();
  const c=cardIndexByNumber.get('BT17-026'); const line=c.effect.split('\\n')[0];
  window.__hs=getEffectHandlers({ownerIndex:pi, cardNumber:'BT17-026', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'メイン', event:'x', zone:'hand'});
  return __hs.map(h=>h.label).join(' | '); })()`);
await ev(`__hs.find(h=>h.isCost).run()`);
await page.waitForTimeout(300);
// トラッシュから2枚を選ぶ画面(出ていれば決定)
for (let k = 0; k < 4; k++) {
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('#detailBody button, .action-bar button, #attackBar button')].find(x => !x.disabled && x.offsetParent && /決定|置く|選ぶ|OK/.test(x.textContent) && !/条件外|キャンセル|やめる/.test(x.textContent));
    if (b) { b.click(); return b.textContent; } return null; });
  await page.waitForTimeout(250);
  if (!clicked) break;
}
o.placed = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const st=P.battle.find(s=>cardEntryNum(s.cards[s.cards.length-1])==='BT17-083'); return !!st && st.cards.length===3 && P.trash.length===0; })()`);
// 続けて「そのテイマーをLv.4のデジモンとして扱いこのカードに進化コスト3で進化する」
await ev(`(() => { const pi=practiceState.viewingIndex; const c=cardIndexByNumber.get('BT17-026'); const line=c.effect.split('\\n')[0];
  getEffectHandlers({ownerIndex:pi, cardNumber:'BT17-026', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'メイン', event:'x', zone:'hand', costPaid:true}).find(h=>/このカードに進化/.test(h.label)).run(); })()`);
await page.waitForTimeout(300);
o.routeCost = await ev(`(() => { const t=document.body.innerText; return /コスト3|進化コスト3/.test(t); })()`);
await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && !x.disabled && /効果で進化/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && !x.disabled && /^(進化する|決定|OK)/.test(x.textContent.trim())); b && b.click(); });
await page.waitForTimeout(300);
o.evolved = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const st=P.battle.find(s=>cardEntryNum(s.cards[s.cards.length-1])==='BT17-026'); return !!st && st.cards.length===4 && !P.hand.includes("BT17-026") && Math.abs(practiceState.memory-5)===3; })()`);
const ng = Object.entries(o).filter(([k, x]) => k !== 'labels' && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
