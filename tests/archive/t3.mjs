import { page, ev, errs, browser, bar, enq, clickAuto } from '../head.mjs';
const ids = await ev(`(() => { const op = practiceState.players[1-practiceState.turn.playerIndex]; op.battle = ['BT17-036','BT16-080'].map(n => ({cards:[n], rested:false})); clearEffectQueue(); renderPracticeBoard(); return op.battle.map(s=>getFxId(s)); })()`);
await enq('【登場時】相手のデジモン1体を持ち主のデッキの下に戻す。'); await clickAuto('デッキ'); await page.waitForTimeout(250);
await page.click(`[data-fxid="${ids[1]}"]`); await page.waitForTimeout(300);
console.log(await bar());
await page.evaluate(() => window.scrollTo(0,0));
await (await page.$('#fxStack')).screenshot({path:'bar.png'});
await browser.close(); console.log('errs', errs);
