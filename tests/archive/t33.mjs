import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=350) => page.waitForTimeout(ms);
const mk = (name) => `{ownerIndex: practiceState.turn.playerIndex, stackUid: null, lki:true, lkiUid:'${name}', cardNumber:'BT1-010', cardName:'${name}', field:'effect', lineIndex:0, text:'【登場時】≪1ドロー≫。', timing:'登場時', event:'t'}`;
const panel = () => page.evaluate(() => { const p=document.getElementById('effectPanel'); return p.hidden ? '(hidden)' : (p.querySelector('.ep-choose-title') ? 'CHOOSE: ' + [...p.querySelectorAll('.ep-choice .ep-name')].map(x=>x.textContent).join(',') : 'CURRENT: ' + (p.querySelector('.ep-current .ep-name')||{}).textContent + ' / ' + [...p.querySelectorAll('.ep-current .ep-btn')].map(b=>b.textContent).join(',')); });
await ev(`(() => { clearEffectQueue(); enqueueEffects([${mk('A')}]); renderEffectPanel(); })()`); await w(); console.log('one', await panel());
await ev(`(() => { clearEffectQueue(); enqueueEffects([${mk('A')}, ${mk('B')}]); renderEffectPanel(); })()`); await w(); console.log('two', await panel());
await page.evaluate(() => document.querySelector('#effectPanel [data-skip]').click()); await w(); console.log('after skip one of two', await panel());
if (process.env.H) {
  await ev(`(() => { clearEffectQueue(); enqueueEffects([${mk('A')}]); renderEffectPanel(); })()`); await w(800);
  await page.screenshot({path:'dock_open.png'});
  await page.click('#lsDockToggle'); await w(); await page.screenshot({path:'dock_closed.png'});
  console.log('toggle closed text', await page.evaluate(()=>document.getElementById('lsDockToggle').textContent));
  await page.click('#lsDockToggle'); await w(); console.log('reopen', await page.evaluate(()=>document.body.classList.contains('ls-dock-open')));
}
await browser.close(); console.log(errs);
