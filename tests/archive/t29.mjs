import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=300) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]', op='practiceState.players[1-practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; ${me}.battle=[{cards:['BT1-010','BT16-080'],rested:false,enteredTurn:-5,dpModifier:1000},{cards:['BT1-010'],rested:false,enteredTurn:-5}]; ${op}.battle=[{cards:['BT1-010'],rested:true}]; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
const det = () => page.evaluate(() => { const m=document.getElementById('cardDetailModal'); if (!m.classList.contains('open')) return '(closed)'; return 'buttons=' + [...document.querySelectorAll('#detailBody button')].map(b=>b.textContent.trim()).filter(t=>t).slice(0,14).join(',') + ' | dpinfo=' + ((document.querySelector('#detailBody .dp-mod-info')||{}).textContent||'-'); });
const bubbleMode = await ev('cardBubbleMode()');
for (const [i, side] of [[0,'me'],[1,'me'],[0,'op']]) {
  const id = await ev(`getFxId(${side==='me'?me:op}.battle[${i}])`);
  await page.click(`[data-fxid="${id}"]`); await w();
  if (bubbleMode) { await page.click(`[data-fxid="${id}"]`); await w(); }
  console.log(side, i, await det());
  await ev('cardDetailModal.classList.remove("open")'); await w();
}
if (bubbleMode) {
  const id = await ev(`getFxId(${me}.battle[0])`); await page.click(`[data-fxid="${id}"]`); await w();
  await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>b.textContent==='⋯').click()); await w();
  console.log('more', await page.evaluate(() => [...document.querySelectorAll('#zonePopup button')].map(b=>b.textContent).join(',')));
  await page.evaluate(() => [...document.querySelectorAll('#zonePopup button')].find(b=>b.textContent==='±DP').click()); await w();
  console.log('after ±DP', await page.evaluate(() => { const z=document.getElementById('zonePopup'); return z.classList.contains('open') ? document.getElementById('zonePopupTitle').innerText : '(closed)'; }));
}
await browser.close(); console.log('mode', bubbleMode, errs);
