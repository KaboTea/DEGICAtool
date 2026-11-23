// BT27-014 の進化元効果「【自分のターン】「ジェムモン」の記述があるこのデジモンは≪急襲≫を得る」: 上のデジモンに「ジェムモン」の記述があれば≪急襲≫
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const pi = await ev('practiceState.turn.playerIndex');
const r = await ev(`(() => { const P=practiceState.players[${pi}]; const out=[];
  P.battle=[{cards:['BT27-014','BT27-018']}]; renderPracticeBoard(); out.push(hasRaidKeyword(P.battle[0]));
  P.battle=[{cards:['BT27-014','BT1-010']}]; renderPracticeBoard(); out.push(hasRaidKeyword(P.battle[0]));
  return out.join(); })()`);
console.log(r);
await browser.close(); console.log(r === 'true,false' ? errs : ['ng']);
