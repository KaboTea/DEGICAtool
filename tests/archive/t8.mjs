import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=250) => page.waitForTimeout(ms);
const toast = () => page.evaluate(() => document.getElementById('toast').textContent);
const setup = (stacks, side='op') => ev(`(() => { const tp=practiceState.turn.playerIndex; const p = practiceState.players[${side==='op'?'1-tp':'tp'}]; p.hand=[]; p.trash=[]; p.battle = ${JSON.stringify(stacks)}; clearEffectQueue(); attackBarState=null; fieldPickMode=null; renderPracticeBoard(); return p.battle.map(s=>getFxId(s)); })()`);
const R = (k) => ({ [k]: { until: 'manual', setTurn: 1 } });
const opInfo = () => ev(`(() => { const op=practiceState.players[1-practiceState.turn.playerIndex]; return 'field=' + op.battle.map(s=>getStackTopCard(s).name+':'+getEffectiveDP(s)).join(',') + ' hand=' + op.hand.length + ' trash=' + op.trash.length; })()`);
// 1 noReturn -> excluded from bounce
let ids = await setup([{cards:['BT1-010'], rested:false, resists:R('noReturn')}, {cards:['BT2-019'], rested:false}]);
await enq('【登場時】相手のデジモン1体を持ち主の手札に戻す。'); await clickAuto('手札'); await w();
console.log('1 banner', await banner());
console.log('1 selectable', await page.$$eval('#practiceBoardPanel .stack-tile.target-pick', els => els.map(e => e.dataset.fxid)), ids);
await page.click('#fieldPickBtns button.cancel');
// 2 only resisted -> message + extra shown
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('noReturn')}]);
await enq('【登場時】相手のデジモン1体を持ち主の手札に戻す。'); await clickAuto('手札'); await w();
console.log('2 banner', await banner()); await page.click('#fieldPickBtns button.cancel');
// 3 all destroy with one immune
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('noDestroyByEffect')}, {cards:['BT2-019'], rested:false}]);
await enq('【登場時】相手のデジモン全てを消滅させる。'); await clickAuto('消滅'); await w(100);
console.log('3 toast', await toast()); console.log('3 bar', (await bar()).slice(0,80));
// 4 immuneOpp blocks DP-
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('immuneOpp')}, {cards:['BT2-019'], rested:false}]);
await enq('【登場時】相手のデジモン1体をDP-1000。'); await clickAuto('DP'); await w();
console.log('4 banner', await banner()); await page.click('#fieldPickBtns button.cancel');
// 4b noDpMinus does not block DP+
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('noDpMinus')}]);
await enq('【登場時】相手のデジモン1体をDP+1000。'); await clickAuto('DP'); await w();
console.log('4b banner', await banner()); await page.click('#fieldPickBtns button.cancel');
// 5 own effect on own resisted -> not blocked
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('noReturn')}], 'me');
await enq('【登場時】自分のデジモン1体を手札に戻す。'); await clickAuto('手札'); await w();
console.log('5 banner', await banner()); await page.click('#fieldPickBtns button.cancel');
// 6 grant Sアタック-1 with immuneOpp
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('immuneOpp')}, {cards:['BT2-019'], rested:false}]);
await enq('【登場時】ターン終了まで、相手のデジモン1体は≪Sアタック-1≫を得る。'); console.log('6 btns', await autoBtns()); await clickAuto('Sアタック'); await w();
console.log('6 banner', await banner()); await page.click('#fieldPickBtns button.cancel').catch(()=>{});
// 7 manual 消滅 on opponent detail -> confirm
ids = await setup([{cards:['BT1-010'], rested:false, resists:R('noDestroyByEffect')}]);
await page.click(`[data-fxid="${ids[0]}"]`); await w();
await page.click('#detailBody button:has-text("消滅")'); await w();
console.log('7 bar', await bar()); await clickBar('やめる'); await w(); console.log('7 after', await opInfo());
await page.click(`[data-fxid="${ids[0]}"]`); await w(); await page.click('#detailBody button:has-text("消滅")'); await w(); await clickBar('それでも'); await w();
console.log('7b bar', (await bar()).slice(0,60));
await browser.close(); console.log('errs', errs);
