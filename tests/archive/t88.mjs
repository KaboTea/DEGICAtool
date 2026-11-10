import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[]; clearEffectQueue(); renderPracticeBoard(); clearEffectQueue(); })()`);
console.log(await ev(`(() => { const q=getEffectQueue(); const before=JSON.stringify([!!q.current,q.pending.length]); ${P(v)}.battle.push({cards:['BT1-010'],rested:false}); renderPracticeBoard(); return before+' '+JSON.stringify(${P(v)}.battle[0].entryInfo)+' '+JSON.stringify([!!q.current,q.pending.length]); })()`));
await browser.close(); console.log(errs);
