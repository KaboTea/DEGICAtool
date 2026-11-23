// 「そのアタックを終了する」(BT13-088 ほか): ボタンでアタックが終わる
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const pi = await ev('practiceState.turn.playerIndex');
const r = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-015'], enteredTurn:-5}]; O.battle=[{cards:['BT1-009','BT13-088']}]; renderPracticeBoard();
  attackState={ attackerStack:P.battle[0], defenderOwner:O, targetType:'player' };
  const hs=getEffectHandlers({ownerIndex:1-${pi}, stackUid:ensureStackUid(O.battle[0]), cardNumber:'BT13-088', cardName:'x', field:'effect', lineIndex:0, text:'相手のデジモン1体をレストさせ、そのアタックを終了する。', timing:'相手のターン', event:'t'});
  const h=hs.find(h=>/アタックを終了/.test(h.label)); if(!h) return 'nobtn:'+hs.map(h=>h.label).join('/'); h.run(); return String(attackState); })()`);
console.log(r);
await browser.close(); console.log(r === 'null' ? errs : ['ng']);
