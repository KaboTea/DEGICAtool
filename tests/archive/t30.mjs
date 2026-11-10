import { page, ev, errs, browser, bar, clickBar } from '../head.mjs';
const w = (ms=300) => page.waitForTimeout(ms);
const op='practiceState.players[1-practiceState.viewingIndex]';
await ev(`(() => { ${op}.battle=[{cards:['BT1-010'],rested:false,resists:{noDestroyByEffect:{until:'manual',setTurn:1}}}]; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
const id = await ev(`getFxId(${op}.battle[0])`); await page.click(`[data-fxid="${id}"]`); await w();
await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>b.textContent==='⋯').click()); await w();
await page.evaluate(() => [...document.querySelectorAll('#zonePopup button')].find(b=>b.textContent==='消滅').click()); await w();
console.log(await bar());
await browser.close(); console.log(errs);
