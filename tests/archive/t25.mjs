import { page, ev, errs, browser, bar, clickBar } from '../head.mjs';
const w = (ms=350) => page.waitForTimeout(ms);
const me = 'practiceState.players[practiceState.viewingIndex]', op='practiceState.players[1-practiceState.viewingIndex]';
const TAG = process.env.TAG || 'ls';
if (process.env.ROT) { await ev(`lsForce = true; lsUpdate(); renderPracticeBoard();`); await w(600); }
console.log('lsActive', await ev('lsActive'), 'rot', await page.evaluate(()=>document.documentElement.classList.contains('ls-rot')));
await ev(`(() => { practiceState.turn.phase='main'; ${me}.battle=[{cards:['BT1-010','BT14-056','BT16-080'],rested:false,enteredTurn:-5,dpModifier:2000},{cards:['BT21-085'],rested:false},{cards:['BT17-097'],rested:false}]; ${op}.battle=[{cards:['BT1-010','BT25-043'],rested:true,locks:{noAttackPlayer:true}}]; ${me}.hand=['BT14-056','AD1-006','BT25-057','BT18-095','AD1-020']; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`);
await w(2200);
await page.evaluate(() => { const b=[...document.querySelectorAll('#lsDock button')].find(x=>/たたむ/.test(x.textContent)); if (b) b.click(); }); await w();
const info = () => page.evaluate(() => { const b=document.getElementById('lsFieldBar'), p=document.getElementById('lsSumPanel'), h=document.querySelector('#practiceBoardPanel .hand-action-bar');
  return 'bar=' + (b ? b.innerText.replace(/\s+/g,' ') : '-') + ' | hand=' + (h ? h.innerText.replace(/\s+/g,' ') : '-') + ' | panel=' + (p ? p.querySelector('.ms-name').textContent + ' / ' + (p.querySelector('.ms-traits')||{}).textContent + ' / secs:' + [...p.querySelectorAll('.ms-sec > span')].map(x=>x.textContent).join(',') : '-'); });
const tapStack = async (i, side='me') => { const id = await ev(`getFxId(${side==='me'?me:op}.battle[${i}])`); await page.click(`[data-fxid="${id}"]`, { force: true }); await w(); };
// field digimon
await tapStack(0); console.log('F1', await info()); await page.screenshot({path:`ov_${TAG}_f1.png`});
await tapStack(0); console.log('F2', await info()); await page.screenshot({path:`ov_${TAG}_f2.png`});
// switch to tamer while panel open
await tapStack(1); console.log('T1', await info());
await tapStack(2); console.log('O1', await info());
await tapStack(0, 'op'); console.log('OPP', await info());
// ⋯
await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>b.textContent==='⋯').click()); await w();
console.log('more popup', await page.evaluate(() => { const z=document.getElementById('zonePopup'); return z.classList.contains('open') ? document.getElementById('zonePopupTitle').innerText + ' :: ' + [...z.querySelectorAll('button')].map(b=>b.textContent).slice(0,12).join(',') : '(closed)'; }));
await page.screenshot({path:`ov_${TAG}_more.png`});
await ev('closeZonePopup()'); await w();
// attack via bubble
await tapStack(0); await w(); console.log('F again', await info());
await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>/アタック/.test(b.textContent)).click()); await w();
console.log('attack started', await ev('!!attackState'), (await page.evaluate(()=>{const b=document.getElementById('fieldPickBanner'); return b.hidden?'':b.innerText.slice(0,40);})));
await ev('cancelAttackRevertToBeforeAttack(); renderPracticeBoard();'); await w();
// hand
await page.click('.ls-hand-tab, #lsHandTab', { force: true }).catch(()=>{}); await ev("document.body.classList.add('ls-hand-up'); renderPracticeBoard();"); await w();
const hc = await page.$$('#practiceBoardPanel .hand-card');
await hc[1].click({ force: true }); await w(); console.log('H1', await info()); await page.screenshot({path:`ov_${TAG}_h1.png`});
await hc[1].click({ force: true }).catch(async()=>{ const h2=await page.$$('#practiceBoardPanel .hand-card'); await h2[1].click({force:true}); }); await w(); console.log('H2', await info()); await page.screenshot({path:`ov_${TAG}_h2.png`});
const h3 = await page.$$('#practiceBoardPanel .hand-card'); await h3[2].click({ force: true }); await w(); console.log('H dual switch', await info());
await page.evaluate(() => [...document.querySelectorAll('#practiceBoardPanel .hand-action-bar .hab-btn')].find(b=>b.textContent==='⋯').click()); await w();
console.log('hand more', await page.evaluate(() => [...document.querySelectorAll('#zonePopup button')].map(b=>b.textContent).join(',')));
await ev('closeZonePopup()');
await page.evaluate(() => document.querySelector('#lsSumPanel .ms-det').click()); await w(); console.log('detail open', await page.evaluate(()=>document.getElementById('cardDetailModal').classList.contains('open')));
await browser.close(); console.log('errs', errs);
