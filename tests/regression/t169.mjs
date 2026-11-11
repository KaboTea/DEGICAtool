// v0.96.11: 横画面で効果パネルがOFFのとき、右端の帯に「⚡ 効果パネル OFF」・タップでONにするか聞く
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(1500);
const o = {};
await ev(`(() => { if (effectPanelEnabled) document.getElementById('effectPanelToggle').click(); practiceState.turn.phase='main'; renderPracticeBoard(); lsUpdateDock(); })()`);
await page.waitForTimeout(300);
o.offLabel = await ev(`(() => { const t=document.getElementById('lsDockToggle'); return t.classList.contains('fx-off') && /効果パネル OFF/.test(t.textContent); })()`);
await page.evaluate(() => document.getElementById('lsDockToggle').click());
await page.waitForTimeout(300);
o.ask = /効果パネルがOFFです/.test(await bar());
await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim() === 'ONにする').click());
await page.waitForTimeout(300);
o.on = await ev(`effectPanelEnabled === true && !document.getElementById('lsDockToggle').classList.contains('fx-off')`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
