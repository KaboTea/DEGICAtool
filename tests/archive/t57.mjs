import { page, ev, browser, bar, clickBar, autoBtns } from '../head.mjs';
const w = (ms=500) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const op='practiceState.players[1-practiceState.viewingIndex]';
// monitor every 100ms
await page.evaluate(() => { window.__bad = []; setInterval(() => {
  if (!document.body.classList.contains('ls-mode')) return;
  const t = document.getElementById('lsDockToggle'); const rc = t.getBoundingClientRect();
  const modalOpen = [...document.querySelectorAll('.modal-backdrop.open')].length > 0;
  const hit = document.elementFromPoint(rc.left + rc.width/2, rc.top + Math.min(rc.height/2, 40));
  const ok = rc.width > 5 && rc.height > 5 && rc.right <= innerWidth + 1 && rc.left >= -1 && (hit === t || t.contains(hit));
  if (!ok && !modalOpen) window.__bad.push(`${(document.getElementById('attackBarMsg')||{}).innerText?.slice(0,30)} | rect=${Math.round(rc.left)},${Math.round(rc.top)},${Math.round(rc.width)}x${Math.round(rc.height)} hit=${hit ? (hit.id || hit.className).toString().slice(0,50) : 'none'} open=${document.body.classList.contains('ls-dock-open')}`);
}, 100); });
const big = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&c.dp>=12000&&c.level===6)?.number`);
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['${big}'],rested:false, enteredTurn:-3}]; ${op}.battle=[{cards:['BT1-010'],rested:false}]; ${me}.hand=['BT1-010','BT1-090','BT2-090']; renderPracticeBoard(); })()`); await w(2500);
// tap own digimon -> bubble -> attack
const id = await ev(`getFxId(${me}.battle[0])`); await page.click(`[data-fxid="${id}"]`); await w();
const btns = await page.evaluate(()=>[...document.querySelectorAll('#lsFieldBar .hab-btn')].map(b=>b.textContent)); console.log('bubble', btns);
await page.evaluate(() => [...document.querySelectorAll('#lsFieldBar .hab-btn')].find(b=>/アタック/.test(b.textContent))?.click()); await w();
await page.screenshot({path:'atk1.png'});
console.log('BAD so far', (await page.evaluate(()=>window.__bad)).slice(-3));
// play tamer & option via modal
await ev(`appearFromHand(2, 'BT2-090')`); await w(); await page.click('#evolveRouteList .evolve-route-item').catch(()=>{}); await w(800);
await ev(`(() => { clearEffectQueue(); enqueueEffects([], [{ownerIndex: practiceState.viewingIndex, stackUid:null, lki:true, lkiUid:'x', cardNumber:'BT1-010', cardName:'テスト', field:'effect', lineIndex:0, text:'【登場時】≪1ドロー≫。', timing:'登場時', event:'t'},{ownerIndex: practiceState.viewingIndex, stackUid:null, lki:true, lkiUid:'y', cardNumber:'BT1-010', cardName:'テスト2', field:'effect', lineIndex:0, text:'【登場時】≪1ドロー≫。', timing:'登場時', event:'t'}]); renderEffectPanel(); })()`); await w(800);
console.log('auto', await autoBtns());
await page.evaluate(()=>document.querySelector('#effectPanel .ep-btn.auto')?.click()); await w(800);
const bad = await page.evaluate(()=>window.__bad);
console.log('BAD', bad.length, [...new Set(bad)].slice(0,12).join('\n'));
await browser.close();
