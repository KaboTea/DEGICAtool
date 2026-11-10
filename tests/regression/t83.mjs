import { page, ev, errs, browser, enq, autoBtns, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX8-045'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-019','BT1-019','BT11-057'],rested:false}]; clearEffectQueue(); renderPracticeBoard(); })()`);
// 1 gating
await enq('相手のデジモン1体を消滅させる。その後、自分のセキュリティが0枚なら、≪1ドロー≫。');
console.log('btns', await autoBtns());
console.log('cls', await page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>b.className+' '+(b.title||''))));
console.log('cond notes', await page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-cond')].map(b=>b.textContent)));
await clickAuto('ドロー'); console.log('after 1 click', await autoBtns(), 'hand', await ev(`${P(v)}.hand.length`));
await ev(`${P(v)}.security=[]`); await ev('renderEffectPanel()');
console.log('sec0 notes', await page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-cond')].map(b=>b.textContent)), await page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto.cond-ng')].length));
// 2 memory
await ev('practiceState.memory = 0');
await enq('メモリーが2以下なら、≪1ドロー≫。');
console.log('mem0', await page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-cond')].map(b=>b.textContent)));
await ev(`practiceState.memory = ${v===0?-3:3}`); await ev('renderEffectPanel()');
console.log('mem own3', await page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-cond')].map(b=>b.textContent)));
// 3 relative target
const tc = await ev(`(() => { const h=${P(v)}.battle[0]; const ta=parseTargetActions('【進化時】このデジモンのDP以下の相手のデジモン1体を消滅させる。')[0]; return getEffectiveDP(h)+' -> '+targetCandidates(ta, ${v}, h).map(s=>getEffectiveDP(s)).join(','); })()`);
console.log('rel target', tc, 'opp DPs', await ev(`${P(o)}.battle.map(getEffectiveDP).join(',')`));
// 4 conditional DP
await ev(`(() => { ${P(v)}.battle=[{cards:['BT13-002','BT1-010'],rested:false}]; })()`);
console.log('BT13-002 inh:', await ev(`cardIndexByNumber.get('BT13-002').inherited`));
const d1 = await ev(`getEffectiveDP(${P(v)}.battle[0])`);
await ev(`${P(v)}.battle.push({cards:['BT1-010'],rested:false})`);
const d2 = await ev(`getEffectiveDP(${P(v)}.battle[0])`);
await ev(`practiceState.turn.playerIndex=${o}`);
const d3 = await ev(`getEffectiveDP(${P(v)}.battle[0])`);
console.log('cond DP alone/with other/opp turn', d1, d2, d3);
await browser.close(); console.log(errs);
