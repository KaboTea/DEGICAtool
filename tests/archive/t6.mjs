import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=250) => page.waitForTimeout(ms);
const setup = (stacks, sec) => ev(`(() => { const op = practiceState.players[1-practiceState.turn.playerIndex]; op.hand=[]; op.trash=[]; op.battle = ${JSON.stringify(stacks)}; ${sec ? `op.security[0] = ${JSON.stringify(sec)};` : ''} clearEffectQueue(); renderPracticeBoard(); return op.battle.map(s=>getFxId(s)); })()`);
const st = () => ev(`(() => { const op = practiceState.players[1-practiceState.turn.playerIndex]; return 'field=' + op.battle.map(s=>getStackTopCard(s).name + '(links:' + (s.links||[]).length + ')').join(',') + ' hand=' + op.hand.length + ' trash=' + op.trash.map(miniCardName).join('/') + ' sec0=' + JSON.stringify(op.security[0]) + ' cur=' + (practiceState.effectQueue.current ? practiceState.effectQueue.current.cardName : '-') + ' pend=' + practiceState.effectQueue.pending.map(e=>e.cardName+'【'+e.timing+'】').join(','); })()`);
const tap = (id) => page.click(`[data-fxid="${id}"]`);
const bounce = async (id) => { await enq('【登場時】相手のデジモン1体を持ち主の手札に戻す。'); await clickAuto('手札に戻す'); await w(); await tap(id); await w(); };
// 1 badge
let ids = await setup([{cards:['BT26-010'], rested:false, links:['BT26-019']}]);
console.log('1 badge', await ev(`stackKeywordBadges(practiceState.players[1-practiceState.turn.playerIndex].battle[0]).map(d=>d.label).join(',')`));
// 2 bounce -> 分離
await bounce(ids[0]); console.log('2 bar', (await bar()).slice(0,200)); await clickBar('分離'); await w(); console.log('2 after', await st());
// 3 link not matching
ids = await setup([{cards:['BT26-010'], rested:false, links:['BT1-010']}]);
await bounce(ids[0]); console.log('3 bar/after', await bar(), await st());
// 4 destroy by effect
ids = await setup([{cards:['BT26-010'], rested:false, links:['BT26-019']}]);
await enq('【登場時】相手のデジモン1体を消滅させる。'); await clickAuto('消滅'); await w(); await tap(ids[0]); await w(); console.log('4 bar', (await bar()).slice(0,200));
await clickBar('分離'); await w(); console.log('4 after', await st());
// 5 ST22-10 face-up, レナモン bounce
ids = await setup([{cards:['BT10-032'], rested:false}], {n:'ST22-10', u:true});
await bounce(ids[0]); console.log('5 bar', (await bar()).slice(0,220)); await clickBar('離れない'); await w(); console.log('5 after', await st());
// 6 ST22-10 face-up, アグモン
ids = await setup([{cards:['BT1-010'], rested:false}], {n:'ST22-10', u:true});
await bounce(ids[0]); console.log('6 bar/after', await bar(), await st());
// 7 ST22-10, battle destroy context
ids = await setup([{cards:['BT10-032'], rested:false}], {n:'ST22-10', u:true});
await ev(`resolveDestructionQueue([practiceState.players[1-practiceState.turn.playerIndex].battle[0]], ()=>{}, {battleContext:true})`); await w();
console.log('7 battle bar', await bar());
await ev(`clearEffectQueue(); attackBarState=null; renderAttackBar();`);
// 8 ST22-10 face-down -> nothing
ids = await setup([{cards:['BT10-032'], rested:false}], 'ST22-10');
await bounce(ids[0]); console.log('8 facedown', await bar(), await st());
await browser.close(); console.log('errs', errs);
