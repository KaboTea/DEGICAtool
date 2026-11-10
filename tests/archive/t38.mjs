import { page, ev, errs, browser, bar, clickBar, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=400) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; practiceState.memory = 0; ${me}.battle=[{cards:['BT1-069'],rested:false,enteredTurn:-5},{cards:['BT11-091'],rested:false},{cards:['P-199'],rested:false}]; ${me}.hand=['BT1-075','AD1-002','BT24-009']; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
console.log('mains', await ev(`getStackMainEffects(${me}.battle[1], practiceState.viewingIndex, 'battle').map(e=>e.text)`));
// tap tamer bubble
const id = await ev(`getFxId(${me}.battle[1])`); await page.click(`[data-fxid="${id}"]`); await w();
console.log('bubble', await page.evaluate(()=>document.getElementById('lsFieldBar')?.innerText.replace(/\s+/g,' ')));
await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>/効果/.test(b.textContent)).click()); await w(600);
console.log('rested?', await ev(`${me}.battle[1].rested`), 'btns', await autoBtns());
await clickAuto('手札から進化'); await w();
console.log('bar', await bar()); await clickBar('デジタマモン'); await w();
console.log('banner', await page.evaluate(()=>document.getElementById('evolveModeText').textContent), 'targets', await page.$$eval('#practiceBoardPanel .stack-tile.target-pick', e=>e.length));
const t0 = await ev(`getFxId(${me}.battle[0])`); await page.click(`[data-fxid="${t0}"]`); await w();
console.log('routes', await page.evaluate(()=>[...document.querySelectorAll('#evolveRouteList .evolve-route-item')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' | ')));
await page.click('#evolveRouteList .evolve-route-item'); await w();
console.log('after', await ev(`${me}.battle[0].cards.map(miniCardName).join('>') + ' mem=' + practiceState.memory`));
await ev('clearEffectQueue(); renderEffectPanel();');
// 登場 version P-199 結城ダン
const id2 = await ev(`getFxId(${me}.battle[2])`); await page.click(`[data-fxid="${id2}"]`); await w();
await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>/効果/.test(b.textContent)).click()); await w(600);
console.log('P-199 rested?', await ev(`${me}.battle[2].rested`), 'btns', await autoBtns());
await clickAuto('手札から登場'); await w();
console.log('popup', await page.evaluate(() => { const z=document.getElementById('zonePopup'); return z.classList.contains('open') ? document.getElementById('zonePopupTitle').innerText + ' :: ' + [...z.querySelectorAll('button')].map(b=>b.textContent).join(',') : '(closed) bar:' ; }), await bar());
await clickBar('シャーマモン'); await w();
console.log('play popup', await page.evaluate(() => [...document.querySelectorAll('#zonePopup button')].map(b=>b.textContent).join(',')));
await page.evaluate(() => [...document.querySelectorAll('#zonePopup button')].find(b=>/効果で登場/.test(b.textContent)).click()); await w();
console.log('played', await ev(`${me}.battle.map(s=>miniCardName(s.cards[s.cards.length-1])).join(',') + ' mem=' + practiceState.memory`));
await browser.close(); console.log(errs);
