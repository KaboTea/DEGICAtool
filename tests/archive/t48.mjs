import { page, ev, errs, browser, bar, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=400) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
// BT18-100-like: hand/trash ルーチェモン; use a 手札/トラッシュ card
const card = await ev(`[...cardIndexByNumber.values()].find(c=>/手札\\/トラッシュの[^。]*支払う進化コスト[-－]\\d+で進化/.test(c.effect||''))?.number`);
const txt = await ev(`cardIndexByNumber.get('${card}').effect`); console.log(card, txt.slice(0,160));
const ev0 = await ev(`JSON.stringify(parseEvolveFromZone(cardIndexByNumber.get('${card}').effect))`); console.log(ev0);
const d4 = await ev(`[...cardIndexByNumber.values()].filter(c=>c.category==='digimon'&&c.level===4).slice(0,3).map(c=>c.number)`);
await ev(`(() => { practiceState.turn.phase='main'; practiceState.memory=0; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['${card}'],rested:false},{cards:['BT13-053','BT1-010'],rested:false}]; ${me}.hand=${JSON.stringify(d4)}; ${me}.trash=${JSON.stringify(d4)}; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel();');
const line = await ev(`cardIndexByNumber.get('${card}').effect.split('\\n').find(l=>/進化できる/.test(l))`);
console.log('handlers', await ev(`(() => { window.__h = evolveFromZoneHandlersFor({ownerIndex:practiceState.viewingIndex, cardNumber:'${card}', cardName:cardIndexByNumber.get('${card}').name, text:${JSON.stringify(line)}, stackUid: ensureStackUid(${me}.battle[0])}, ${me}.battle[0]); return window.__h.map(h=>h.label).join(' / '); })()`));
await ev('window.__h[window.__h.length-1].run()'); await w();
console.log('picker', await page.evaluate(()=>document.getElementById('detailBody').innerText.replace(/\s+/g,' ').slice(0,300)));
await page.screenshot({path:'/mnt/user-data/outputs/mock/eep_844.png'});
const sn = await page.$('.eep-showng'); if (sn) { await sn.click(); await w(); }
await page.click('.eep-go'); await w();
console.log('banner', await page.evaluate(()=>document.getElementById('evolveModeText')?.textContent));
const st = await ev(`getFxId(${me}.battle[1])`); await page.click(`[data-fxid="${st}"]`).catch(e=>console.log('click fail')); await w();
console.log('routes', await page.evaluate(()=>[...document.querySelectorAll('#evolveRouteList .evolve-route-item')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' | ')), 'manual', await ev('evolveManualCost.value'));
await page.screenshot({path:'/mnt/user-data/outputs/mock/eep_route_844.png'});
await browser.close(); console.log(errs);
