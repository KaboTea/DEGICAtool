// BT27-020「相手のデジモン1体の進化元を上か下から1枚破棄する」: 上か下かを選ぶ
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const run = async (which) => {
  await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','BT27-020']}]; O.battle=[{cards:['BT1-009','BT1-010','BT1-015']}]; O.trash=[]; renderPracticeBoard();
    const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-020', cardName:'x', field:'inherited', lineIndex:0, text:'相手のデジモン1体の進化元を上か下から1枚破棄する。', timing:'x', event:'t'}).find(h=>/上か下/.test(h.label)); h.run();
    if (fieldPickMode) { fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); } })()`);
  await page.waitForTimeout(150);
  await page.evaluate((w) => [...document.querySelectorAll('#attackBarActs button, #detailBody button')].find(x => x.textContent.includes(w)).click(), which);
  await page.waitForTimeout(150);
  return ev(`practiceState.players[1-${pi}].trash.join()`);
};
o.top = await run('上から1枚');
o.bottom = await run('下から1枚');
o.ok = o.top === 'BT1-010' && o.bottom === 'BT1-009';
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
