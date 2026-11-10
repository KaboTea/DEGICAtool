import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
const setup = (nums) => ev(`(() => { const op = practiceState.players[1-practiceState.turn.playerIndex]; op.hand=[]; op.trash=[]; op.battle = ${JSON.stringify(nums)}.map(n => ({cards:[n], rested:false})); clearEffectQueue(); renderPracticeBoard(); return op.battle.map(s=>getFxId(s)); })()`);
const st = () => ev(`(() => { const op = practiceState.players[1-practiceState.turn.playerIndex]; return 'field=' + op.battle.map(s=>getStackTopCard(s).name).join(',') + ' hand=' + op.hand.length + ' trash=' + op.trash.length + ' cur=' + (practiceState.effectQueue.current ? practiceState.effectQueue.current.cardName : '-'); })()`);
const tap = (id) => page.click(`[data-fxid="${id}"]`);
const w = (ms=250) => page.waitForTimeout(ms);
// A: bounce -> 離れない
let ids = await setup(['BT17-036']);
await enq('【登場時】相手のデジモン1体を持ち主の手札に戻す。'); console.log('A btns', await autoBtns());
await clickAuto('手札に戻す'); await w(); console.log('A banner', await banner());
await tap(ids[0]); await w(); console.log('A bar', await bar());
await clickBar('離れない'); await w(); console.log('A after', await st());
// B: bounce -> そのまま
ids = await setup(['BT17-036']);
await enq('【登場時】相手のデジモン1体を持ち主の手札に戻す。'); await clickAuto('手札に戻す'); await w(); await tap(ids[0]); await w();
await clickBar('そのまま'); await w(); console.log('B after', await st());
// C: 2体 sequential
ids = await setup(['BT17-036', 'BT17-036']);
await enq('【登場時】相手のデジモン2体を持ち主の手札に戻す。'); await clickAuto('手札に戻す'); await w(); await tap(ids[0]); await w(); await tap(ids[1]); await w();
console.log('C bar1', (await bar()).slice(0,60)); await clickBar('そのまま'); await w();
console.log('C bar2', (await bar()).slice(0,60)); await clickBar('離れない'); await w(); console.log('C after', await st());
// D: 🎯破棄
ids = await setup(['BT17-036']);
await enq('【登場時】相手のデジモン1体を破棄する。'); console.log('D btns', await autoBtns()); await clickAuto('破棄'); await w(); await tap(ids[0]); await w();
console.log('D bar', (await bar()).slice(0,90)); await clickBar('そのまま'); await w(); console.log('D after', await st());
// E: destroy regression
ids = await setup(['BT17-036']);
await enq('【登場時】相手のデジモン1体を消滅させる。'); await clickAuto('消滅'); await w(); await tap(ids[0]); await w();
console.log('E bar', (await bar()).slice(0,140));
// F: no preventer -> moves without prompt
ids = await setup(['BT1-010']);
await enq('【登場時】相手のデジモン1体を持ち主の手札に戻す。'); await clickAuto('手札に戻す'); await w(); await tap(ids[0]); await w(); console.log('F after', await st(), await bar());
await page.screenshot({path:'a.png'});
await browser.close(); console.log('errs', errs);
