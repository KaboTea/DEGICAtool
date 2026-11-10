import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=350) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const find = (expr) => ev(`[...cardIndexByNumber.values()].find(c=>${expr})?.number`);
const fpBtns = () => page.evaluate(() => [...document.querySelectorAll('#fieldPickBtns button')].map(b=>b.textContent.trim()).join(' / ') + ' :: ' + (document.getElementById('fieldPickText')?.innerText||''));
const bem = await find("c.name==='ベムモン'"); const ag = 'BT1-010';
const setup = async (battle, hand, trash) => { await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=${JSON.stringify(battle)}.map(c=>({cards:c,rested:false})); ${me}.raising=null; ${me}.hand=${JSON.stringify(hand)}; ${me}.trash=${JSON.stringify(trash)}; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel();'); };
console.log('src only bem', await (async()=>{ await setup([[bem]], ['BT18-065'], [bem,bem,ag]); return ev(`JSON.stringify(digixrosExtraSources(cardIndexByNumber.get('BT18-065'), practiceState.viewingIndex).map(x=>x.label+' | '+x.reason))`); })());
console.log('src with agumon', await (async()=>{ await setup([[bem],[ag]], ['BT18-065'], [bem]); return ev(`JSON.stringify(digixrosExtraSources(cardIndexByNumber.get('BT18-065'), practiceState.viewingIndex).map(x=>x.label))`); })());
// full flow BT18-065
await setup([[bem]], ['BT18-065'], [bem,bem,ag]);
await ev(`enterMultiEvolveMode(0,'BT18-065','digixros')`); await w();
console.log('buttons', await fpBtns());
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/トラッシュから材料/.test(b.textContent)).click()); await w();
await page.click('.cmp-all'); await w(); await page.click('.cmp-act'); await w();
console.log('after trash', await fpBtns(), 'trash', await ev(`${me}.trash.length`));
// cancel restores
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/^(やめる|キャンセル)$/.test(b.textContent.trim()))?.click()); await w();
console.log('cancel trash', await ev(`${me}.trash.length`), 'hand', await ev(`${me}.hand.join()`));
// tamer BT19-087 ネネ (1枚ずつ, 合成型/トワイライト)
const dx = await find("c.category==='digimon' && /≪≪デジクロス/.test(c.effect||'') && /合成型|トワイライト/.test(c.type||'')");
await setup([['BT1-084', ag, 'BT19-087']], [dx], [bem, ag]);
await ev(`(() => { ${me}.battle[0].cards=[${JSON.stringify(ag)}, ${JSON.stringify(bem)}, 'BT19-087']; renderPracticeBoard(); })()`);
await ev(`enterMultiEvolveMode(0,'${dx}','digixros')`); await w();
console.log('nene buttons', dx, await fpBtns());
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/テイマーの下から/.test(b.textContent)).click()); await w();
console.log('picker', await page.evaluate(()=>document.getElementById('detailBody').innerText.replace(/\s+/g,' ').slice(0,200)));
await page.click('.cmp-row'); await page.click('.cmp-act'); await w();
console.log('after', await fpBtns(), 'rested', await ev(`${me}.battle[0].rested`), 'cards', await ev(`${me}.battle[0].cards.length`));
await browser.close(); console.log(errs);
