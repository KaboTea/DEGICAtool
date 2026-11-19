// 「相手のデジモンの進化元を選んで2枚破棄する」で、育成エリアのデジモンは選べない(3-4-7-5)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const pi = await ev('practiceState.turn.playerIndex');
const r = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','BT1-010']}];
  O.battle=[{cards:['BT1-009','BT1-010']}]; O.raising={cards:['BT1-001','BT1-009']}; renderPracticeBoard();
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT1-010', cardName:'x', field:'effect', lineIndex:0, text:'相手のデジモンの進化元を選んで2枚破棄する。', timing:'x', event:'t'}).find(h=>/進化元/.test(h.label));
  if(!h) return 'nobtn'; h.run(); if (!fieldPickMode) return 'direct'; const c=fieldPickMode.candidates; const ok=c.length===1 && c[0]===O.battle[0]; cancelTargetModes(); return ok; })()`);
console.log(r);
await browser.close(); console.log(r === true || r === 'direct' ? errs : ['ng']);
