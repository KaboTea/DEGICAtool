import { page, ev, errs, browser, enq } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[['BT13-002','BT1-010','BT12-007','BT14-007','EX8-045'],['BT16-002','BT13-047','BT1-019'],['BT1-004','BT1-008','BT1-010'],['BT10-060']].map(c=>({cards:c,rested:false})); ${P(o)}.battle=[['BT13-048','BT13-052','BT11-057'],['BT1-010'],['BT1-019']].map(c=>({cards:c,rested:false})); clearEffectQueue(); renderPracticeBoard(); })()`);
await enq('相手のデジモン1体を消滅させる。その後、自分のセキュリティが0枚なら、≪1ドロー≫。');
console.log(await ev(`(() => { const t=performance.now(); for(let i=0;i<10;i++) renderPracticeBoard(); return ((performance.now()-t)/10).toFixed(1)+'ms'; })()`));
await browser.close(); console.log(errs);
