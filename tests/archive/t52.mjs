import { page, ev, errs, browser, bar, clickBar } from '../head.mjs';
const w = (ms=500) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const op='practiceState.players[1-practiceState.viewingIndex]';
const big = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&c.dp>=13000&&!c.effect)?.number || [...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&c.dp>=13000)?.number`);
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['${big}'],rested:false}]; ${op}.battle=[{cards:['BT13-043','EX13-032'],rested:false}]; ${op}.security=['BT1-010','BT1-010']; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel();');
await ev(`resolveBattle(${me}.battle[0], ${op}.battle[0], { isMainAttackBattle:false, onComplete: ()=>{} })`); await w();
for (let i=0;i<4;i++){ const b = await bar(); console.log(i, b); const m = b.match(/\|\| (.*)$/); if(!m) break; const first = m[1].split(' / ')[0]; if (/消滅します/.test(b)) break; await clickBar("次へ"); await w(); }
await page.screenshot({path:'des_'+(process.env.W)+'.png'}); console.log('queue', await ev(`JSON.stringify(practiceState.effectQueue && practiceState.effectQueue.current && practiceState.effectQueue.current.text)`));
await browser.close(); console.log(errs);
