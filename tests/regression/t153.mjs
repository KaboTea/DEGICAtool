// v0.93.1: フェンリルガモン「ターン終了条件が、メモリーが相手側の3以上」: 自動エンドもエンドの判定も3で
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const out = {};
const pi = await ev('practiceState.turn.playerIndex');
const setMem = (n) => ev(`(() => { snapshotPracticeState(); practiceState.memory = ${pi}===0 ? ${n} : -${n}; renderPracticeBoard(); })()`);
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT14-081'],rested:false}]; renderPracticeBoard(); })()`);
out.th3 = (await ev('turnEndThreshold()')) === 3;
await setMem(1); await page.waitForTimeout(1500);
out.stay1 = (await ev('practiceState.turn.phase')) === 'main';
await setMem(3); await page.waitForTimeout(1500);
out.end3 = (await ev('practiceState.turn.phase')) === 'end';
// 進化元のBT17-069: 一番上の名称に「フェンリルガモン」を含む間だけ
await ev(`(() => { practiceState.turn.phase='main'; const P=practiceState.players[${pi}]; P.battle=[{cards:['BT17-069','BT1-010'],rested:false}]; renderPracticeBoard(); })()`);
out.srcNo = (await ev('turnEndThreshold()')) === 1;
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT17-069','BT14-081'],rested:false}]; renderPracticeBoard(); })()`);
out.srcYes = (await ev('turnEndThreshold()')) === 3;
const ng = Object.entries(out).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(out));
await browser.close(); console.log(ng.length ? ng : errs);
