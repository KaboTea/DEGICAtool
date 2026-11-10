import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=400) => page.waitForTimeout(ms);
const info = await ev(`(() => { const l=[...cardIndexByNumber.values()].find(c=>/〈リンク〉特徴「アプモン」/.test(c.inherited||'')) || [...cardIndexByNumber.values()].find(c=>/〈リンク〉特徴「/.test(c.inherited||'')); const cond=linkConditionsOf(l)[0]; const ok=[...cardIndexByNumber.values()].filter(c=>c.category==='digimon'&&c.level>=3&&revealCondMatches(c,cond)).slice(0,2).map(c=>c.number); const ng=[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&c.level===5&&!revealCondMatches(c,cond)).number; return JSON.stringify({link:l.number, cond, ok, ng}); })()`);
console.log(info); const I = JSON.parse(info);
const v = await ev('practiceState.viewingIndex'); const P = `practiceState.players[${v}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P}.battle=[{cards:['${I.ok[0]}'],rested:false, links:['${I.link}']}]; ${P}.hand=['${I.ok[1]}','${I.ng}']; clearEffectQueue(); renderPracticeBoard(); })()`); await w();
// evolve into matching card via finalize directly
await ev(`(() => { enterEvolveMode(0, '${I.ok[1]}'); evolveRouteTarget = ${P}.battle[0]; finalizeEvolve(0); })()`); await w();
console.log('after ok evolve links', await ev(`JSON.stringify(${P}.battle[0].links)`));
await ev(`(() => { const i=${P}.hand.indexOf('${I.ng}'); enterEvolveMode(i, '${I.ng}'); evolveRouteTarget = ${P}.battle[0]; finalizeEvolve(0); })()`); await w();
console.log('after ng evolve links', await ev(`JSON.stringify(${P}.battle[0].links)`), 'trash has link', await ev(`${P}.trash.includes('${I.link}')`));
await browser.close(); console.log(errs);
