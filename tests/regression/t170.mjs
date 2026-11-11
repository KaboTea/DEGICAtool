// v0.96.12: 一覧の「送る▾」で詳細を閉じて送り先へ・横画面で手札を開いているとき盤面を押したらしまう
import { page, ev, errs, browser } from '../head.mjs';
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(1500);
const o = {};
await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; P.trash=['BT1-010','BT1-019']; practiceState.turn.phase='main'; renderPracticeBoard(); openTrashListView(); })()`);
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('.trash-row-move').click());
await page.waitForTimeout(300);
o.detailClosed = await ev(`!cardDetailModal.classList.contains('open')`);
o.popupOpen = await ev(`document.getElementById('zonePopup').classList.contains('open') && /送る/.test(document.getElementById('zonePopupTitle').textContent)`);
await page.evaluate(() => [...document.querySelectorAll('#zonePopupActions button')].find(b=>b.textContent==='手札へ').click());
await page.waitForTimeout(300);
o.sent = await ev(`practiceState.players[practiceState.viewingIndex].hand.includes('BT1-010')`);
// 手札を開いて盤面を押すとしまう
await page.evaluate(() => document.getElementById('lsHandTab').click());
await page.waitForTimeout(200);
o.handUp = await ev(`document.body.classList.contains('ls-hand-up')`);
await page.evaluate(() => document.getElementById('oppMatBlock').click());
await page.waitForTimeout(200);
o.handClosed = await ev(`!document.body.classList.contains('ls-hand-up')`);
// 手札のカードを押しても閉じない
await page.evaluate(() => document.getElementById('lsHandTab').click());
await page.waitForTimeout(200);
await page.evaluate(() => { const c=document.querySelector('.hand-row .hand-card, .hand-row [data-hand-idx]'); c && c.click(); });
await page.waitForTimeout(200);
o.handStays = await ev(`document.body.classList.contains('ls-hand-up')`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
