import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=300) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; ${me}.hand=['BT14-056','AD1-020']; ${me}.battle=[{cards:['BT1-010','BT16-080'],rested:false,enteredTurn:-5},{cards:['BT21-085'],rested:false}]; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
let hc = await page.$$('#practiceBoardPanel .hand-card'); await hc[0].click(); await w();
console.log('hand digimon:', await page.evaluate(()=>document.querySelector('#practiceBoardPanel .hand-action-bar .hab-name').textContent));
await (await page.$('#practiceBoardPanel .hand-action-bar')).screenshot({path:'lvbar.png'});
hc = await page.$$('#practiceBoardPanel .hand-card'); await hc[1].click(); await w();
console.log('hand tamer:', await page.evaluate(()=>document.querySelector('#practiceBoardPanel .hand-action-bar .hab-name').textContent));
for (const i of [0,1]) { const id = await ev(`getFxId(${me}.battle[${i}])`); await page.click(`[data-fxid="${id}"]`); await w(); console.log('field', i, await page.evaluate(()=>document.querySelector('#lsFieldBar .hab-name').textContent)); await page.mouse.click(700, 700); await w(); }
await browser.close(); console.log(errs);
