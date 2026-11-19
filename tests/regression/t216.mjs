// 「レストできない」「アタックできない」が付いたデジモンは、効果のアタックで選べない(レストせずにアタックする効果は「レストできない」でも選べる)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const run = (text, locks) => ev(`(() => { const P=practiceState.players[${pi}]; practiceState.viewingIndex=${pi}; attackState=null;
  P.battle=[{cards:['BT1-010'], locks:${JSON.stringify(locks)}, enteredTurn:-5},{cards:['BT1-015'], enteredTurn:-5},{cards:['BT2-087']}]; renderPracticeBoard();
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[2]), cardNumber:'BT2-087', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'x', event:'t'}).find(h=>/アタック/.test(h.label));
  if(!h) return 'nobtn'; h.run(); const r = attackState ? 'atk:'+getStackTopCard(attackState.attackerStack).number : fieldPickMode ? 'pick:'+fieldPickMode.candidates.map(st=>getStackTopCard(st).number).join() : 'none';
  cancelTargetModes && cancelTargetModes(); attackState=null; return r; })()`);
o.rest = await run('自分のデジモン1体でアタックする。', { noRest: true });
o.ok_rest = o.rest === 'atk:BT1-015';
o.atk = await run('自分のデジモン1体でアタックする。', { noAttack: true });
o.ok_atk = o.atk === 'atk:BT1-015';
o.noRest = await run('自分のデジモン1体でレストせずアタックできる。', { noRest: true });
o.ok_noRest = o.noRest === 'pick:BT1-010,BT1-015';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
