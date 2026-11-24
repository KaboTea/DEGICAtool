// 「Aする。この効果でAしなかったなら、Bできる」(BT27-029 の進化元効果): Aを実行したらBは押せない / Bを実行したらAは押せない
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const ice = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&/氷雪型/.test(c.type||'')&&c.level===5).number`);
const setup = (js) => ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT27-029','${ice}'], rested:true}]; O.battle=[{cards:['BT1-009','BT1-009','BT1-010']}]; O.trash=[]; clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard();
  window.__e={ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-029', cardName:'x', field:'inherited', lineIndex:0, text:'[ターン1回]相手のデジモン1体の進化元を下から2枚破棄する。この効果で破棄しなかったなら、特徴「氷雪型」を持つこのデジモンをアクティブにできる。', timing:'自分のターン終了時', event:'t'}; ${js} })()`);
const hs = () => ev(`effectHandlersWithConds(window.__e).handlers.map(h=>(h.condNg?'NG:':'')+h.label).join(' / ')`);
// 1 Aを実行 → Bは押せない
await setup('');
await ev(`(() => { effectHandlersWithConds(window.__e).handlers.find(h=>/進化元を下から/.test(h.label)).run(); if (fieldPickMode) { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); } })()`);
await page.waitForTimeout(150);
o.afterA = await hs();
o.ok_A = /NG:🔄 このデジモンをアクティブ/.test(o.afterA) && !/NG:🎯/.test(o.afterA);
// 2 Bを実行 → Aは押せない
await setup('');
await ev(`effectHandlersWithConds(window.__e).handlers.find(h=>/アクティブ/.test(h.label)).run()`);
await page.waitForTimeout(150);
o.afterB = await hs();
o.ok_B = /NG:🎯 相手のデジモン1体の進化元を下から/.test(o.afterB) && await ev(`practiceState.players[${pi}].battle[0].rested === false`);
// 3 Aを押してやめた(盤面が動いていない)ならBは押せる
await setup('');
await ev(`(() => { effectHandlersWithConds(window.__e).handlers.find(h=>/進化元を下から/.test(h.label)).run(); cancelTargetModes(); })()`);
await page.waitForTimeout(150);
o.cancelA = await hs();
o.ok_cancel = !/NG:/.test(o.cancelA);
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
