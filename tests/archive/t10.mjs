import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=250) => page.waitForTimeout(ms);
const me = 'practiceState.players[practiceState.viewingIndex]', op = 'practiceState.players[1-practiceState.viewingIndex]';
// --- attack: lock noAttackPlayer
await ev(`(() => { practiceState.turn.phase='main'; ${me}.battle=[{cards:['BT1-010'],rested:false,enteredTurn:-5,locks:{noAttackPlayer:true}}]; ${op}.battle=[]; clearEffectQueue(); renderPracticeBoard(); declareAttack(${me}.battle[0]); })()`); await w();
console.log('A1 banner', await banner());
await page.click('#fieldPickBtns button:has-text("相手プレイヤーへ")'); await w(); console.log('A1 bar', await bar());
await clickBar('やめる'); await w(); console.log('A1 back', await banner());
await page.click('#fieldPickBtns button:has-text("相手プレイヤーへ")'); await w(); await clickBar('それでも'); await w(); console.log('A1 forced', (await bar()).slice(0,40), await ev('attackState && attackState.targetType'));
await ev('cancelAttackRevertToBeforeAttack()'); await w();
// --- static BT11-037 (自分のターン)
await ev(`(() => { ${me}.battle=[{cards:['BT11-037'],rested:false,enteredTurn:-5}]; renderPracticeBoard(); declareAttack(${me}.battle[0]); })()`); await w();
console.log('A2 banner', await banner()); await ev('cancelAttackRevertToBeforeAttack()'); await w();
// --- static BT23-051 no digimon target
await ev(`(() => { ${me}.battle=[{cards:['BT23-051'],rested:false,enteredTurn:-5}]; ${op}.battle=[{cards:['BT1-010'],rested:true}]; renderPracticeBoard(); declareAttack(${me}.battle[0]); })()`); await w();
console.log('A3 banner', await banner(), '| selectable', await page.$$eval('#practiceBoardPanel .stack-tile.target-pick', e => e.length)); await ev('cancelAttackRevertToBeforeAttack()'); await w();
// --- evolve restrictions
console.log('E reasons', await ev(`(() => {
  const mk = (n, extra) => Object.assign({cards:['BT1-010', n], rested:false}, extra||{});
  const P = ${me};
  const out = [];
  P.battle = [mk('BT1-010',{locks:{noEvolve:true}})]; out.push('lock:' + evolveBlockReason(P.battle[0], cardIndexByNumber.get('BT2-019')));
  P.battle = [mk('BT13-080')]; out.push('BT13-080:' + evolveBlockReason(P.battle[0], cardIndexByNumber.get('BT2-019')));
  P.battle = [mk('BT15-031')]; out.push('white-only red:' + evolveBlockReason(P.battle[0], cardIndexByNumber.get('BT17-018')) + ' / white:' + evolveBlockReason(P.battle[0], cardIndexByNumber.get('BT1-084')));
  P.battle = [mk('BT1-010')]; out.push('normal:' + evolveBlockReason(P.battle[0], cardIndexByNumber.get('BT2-019')));
  return out.join(' | ');
})()`));
// evolve UI with lock: tile not highlighted, click -> confirm
const id = await ev(`(() => { const P=${me}; P.battle=[{cards:['BT1-010'],rested:false,locks:{noEvolve:true}}, {cards:['BT1-010'],rested:false}]; P.hand=['BT2-019']; renderPracticeBoard(); enterEvolveMode(0,'BT2-019'); return P.battle.map(getFxId); })()`); await w();
console.log('E ui targets', await page.$$eval('#practiceBoardPanel .stack-tile.target-pick', e => e.map(x=>x.dataset.fxid)), id);
await page.click(`[data-fxid="${id[0]}"]`); await w(); console.log('E bar', await bar());
await clickBar('それでも'); await w(); console.log('E route modal', await page.evaluate(() => document.getElementById('evolveRouteModal').classList.contains('open')));
await page.click('#evolveRouteCancel'); await w();
// noPlayEffect validity
console.log('P', await ev(`(() => { const P=${me}; P.battle=[{cards:['BT1-010'],rested:false}]; const st=P.battle[0]; const e={ownerIndex:practiceState.viewingIndex, stackUid:ensureStackUid(st), cardNumber:'BT1-010', field:'effect', lineIndex:0, text:'x', timing:'登場時'}; const a=isEffectEntryValid(e); st.locks={noPlayEffect:true}; return a + '->' + isEffectEntryValid(e); })()`));
// lock button from effect panel
await ev(`(() => { ${op}.battle=[{cards:['BT1-010'],rested:false}]; renderPracticeBoard(); })()`);
await enq('【登場時】相手のターン終了まで、相手のデジモン1体は進化できず、プレイヤーにアタックできない。'); console.log('L btns', await autoBtns());
await browser.close(); console.log('errs', errs);
