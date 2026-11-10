import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=350) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const body = () => page.evaluate(()=>document.getElementById('detailBody').innerText.replace(/\s+/g,' ').slice(0,260));
const bem = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='ベムモン')?.number`);
// coverage
console.log('cov', await ev(`(() => { let n=0; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>{ n+=parseMaterialFromZone(c[f]||'').length; })); return n; })()`));
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['BT11-111'],rested:false},{cards:['BT1-010'],rested:false}]; ${me}.trash=['${bem}','BT1-010','${bem}','${bem}','${bem}','${bem}']; ${me}.hand=[]; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel();');
const line = await ev(`cardIndexByNumber.get('BT11-111').effect.split('\\n').find(l=>/進化元の下/.test(l))`);
console.log(await ev(`(() => { window.__h = materialFromZoneHandlersFor({ownerIndex:practiceState.viewingIndex, cardNumber:'BT11-111', cardName:'スナッチモン', text:${JSON.stringify(line)}}, ${me}.battle[0]); return window.__h.map(h=>h.label).join(' / '); })()`));
await ev('window.__h[0].run()'); await w(); console.log('A', await body());
await page.click('.cmp-all'); await w(); console.log('A all', await body());
await page.screenshot({path:'/mnt/user-data/outputs/mock/multi_844.png'});
await page.click('.cmp-act'); await w();
console.log('stack', await ev(`${me}.battle[0].cards.map(x=>miniCardName(cardEntryNum(x))).join('>')`), 'trash', await ev(`${me}.trash.length`));
// assembly
await ev(`(() => { ${me}.trash=[${JSON.stringify((await ev(`[...cardIndexByNumber.values()].filter(c=>c.name==='グレイモン').slice(0,2).map(c=>c.number)`)))}].flat().concat(['BT1-010']); ${me}.hand=['AD1-009']; renderPracticeBoard(); enterAssemblyMode(0,'AD1-009'); })()`); await w(); console.log('B', await body());
await page.click('.cmp-cancel'); await w();
// trash bulk
await ev(`(() => { ${me}.trash=['BT1-010','BT1-010','${bem}']; renderPracticeBoard(); openTrashListView(); })()`); await w();
await page.click('.trash-multi'); await w(); await page.click('.cmp-row[data-i="0"]'); await page.click('.cmp-row[data-i="2"]'); await w(); console.log('C', await body());
await page.click('.cmp-act'); await w(); const id = await ev(`getFxId(${me}.battle[1])`); await page.click(`[data-fxid="${id}"]`); await w();
console.log('fp bar', await page.evaluate(()=>document.body.innerText.includes('表向き')));
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/^表向き/.test(b.textContent.trim()))?.click()); await w();
console.log('stack2', await ev(`${me}.battle[1].cards.map(x=>miniCardName(cardEntryNum(x))).join('>')`), 'trash', await ev(`${me}.trash.join()`));
await browser.close(); console.log(errs);
