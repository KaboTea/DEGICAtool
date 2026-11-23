// 「〜ごとに、このデジモンは≪Sアタック+1≫を得る」(ST25-05 DP8000ごと / EX5-014 進化元3枚ごと / EX2-074 トラッシュ10枚ごと / BT2-050 他のレストのデジモン1体ごと)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const pi = await ev('practiceState.turn.playerIndex');
const r = await ev(`(() => { const P=practiceState.players[${pi}]; const out=[];
  [12000,16000,29000].forEach(dp=>{ P.battle=[{cards:['BT1-009','ST25-05'], dpModifier: dp-12000}]; renderPracticeBoard(); out.push(effectiveSAttackBonus(P.battle[0])); });
  P.battle=[{cards:Array(6).fill('BT1-009').concat(['EX5-014'])}]; renderPracticeBoard(); out.push(effectiveSAttackBonus(P.battle[0]));
  P.trash=Array(25).fill('BT1-010'); P.battle=[{cards:['BT1-009','EX2-074']}]; renderPracticeBoard(); out.push(effectiveSAttackBonus(P.battle[0]));
  P.battle=[{cards:['BT1-009','BT2-050']},{cards:['BT1-010'], rested:true},{cards:['BT1-015'], rested:true}]; renderPracticeBoard(); out.push(effectiveSAttackBonus(P.battle[0]));
  return out.join(); })()`);
console.log(r);
await browser.close(); console.log(r === '1,2,3,2,2,2' ? errs : ['ng']);
