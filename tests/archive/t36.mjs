import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=350) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; ${me}.raising={cards:['BT1-001'],rested:false}; ${me}.battle=[{cards:['BT1-010'],rested:false}]; ${me}.hand=['BT2-019','AD1-001']; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w(1500);
await ev(`enterEvolveMode(1, 'AD1-001'); performEvolve(${me}.battle[0]);`); await w();
const st = () => page.evaluate(() => 'routes=' + [...document.querySelectorAll('#evolveRouteList .evolve-route-item')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' | ') + ' manualHidden=' + document.getElementById('evolveManualBody').hidden + ' toggle=' + document.getElementById('evolveManualToggle').textContent);
console.log('normal', await st());
await page.screenshot({ path: `evo_${process.env.W||1280}.png` });
await page.click('#evolveManualToggle'); await w(); console.log('toggled', await st());
await page.click('#evolveRouteCancel'); await w();
// no-route case
await ev(`exitEvolveMode(); enterEvolveMode(0, 'BT2-019'); performEvolve(${me}.battle[0]);`); await w();
console.log('noroute', await st());
await browser.close(); console.log(errs);
