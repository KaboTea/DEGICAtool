import { page, ev, errs, browser, enq } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; practiceState.memory=0; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX8-045'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; clearEffectQueue(); renderPracticeBoard(); })()`);
await enq('【アタック時】相手のデジモン1体を消滅させる。その後、自分のセキュリティが0枚なら、≪1ドロー≫。メモリーが2以下なら、メモリー+1。');
await page.waitForTimeout(300);
const el = await page.$('#effectPanel'); await el.screenshot({ path: '/mnt/user-data/outputs/mock/cond_gate.png' });
await browser.close(); console.log(errs);
