// ST25-05 ルビウスドラモン「DP合計7000まで…このデジモンのDP8000ごとに、このDP消滅効果の上限+4000」: DP29000 → 3×4000 → 合計19000まで
import { page, ev, errs, browser, banner } from '../head.mjs';
await page.waitForTimeout(1500);
const pi = await ev('practiceState.turn.playerIndex');
const r = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; practiceState.viewingIndex=${pi};
  P.battle=[{cards:['BT1-009','ST25-05'], dpModifier: 29000 - (cardIndexByNumber.get('ST25-05').dp||0)}]; O.battle=[{cards:['BT1-010']}]; renderPracticeBoard(); clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard();
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'ST25-05', cardName:'x', field:'effect', lineIndex:0, text:'DP合計7000まで、相手のデジモンを消滅させる。このデジモンのDP8000ごとに、このDP消滅効果の上限+4000。', timing:'進化時', event:'t'}).find(h=>/DP合計/.test(h.label));
  if(!h) return 'nobtn'; h.run(); return 'ok'; })()`);
const b = (await banner()) + ' / toast=' + (await ev('toastEl.textContent')); await ev('cancelTargetModes()');
console.log(r, b);
// ST25-06「ターン終了まで、自分のデジモン1体は相手のオプションの効果を受けず、DP+3000」: 耐性とDP+の2つのボタン
const k = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['ST25-06']}]; return getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'ST25-06', cardName:'x', field:'effect', lineIndex:1, text:'このテイマーをレストさせることで、ターン終了まで、自分のデジモン1体は相手のオプションの効果を受けず、DP+3000。', timing:'自分のターン', event:'t'}).map(h=>h.label).join(' / '); })()`);
console.log(k);
await browser.close(); console.log(/19000/.test(b) && /DP\+3000/.test(k) && /耐性/.test(k) ? errs : ['ng']);
