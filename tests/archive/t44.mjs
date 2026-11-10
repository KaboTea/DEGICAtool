import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=300) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const find = (expr) => ev(`[...cardIndexByNumber.values()].find(c=>${expr})?.number`);
const modal = () => page.evaluate(() => { const m=document.getElementById('evolveRouteModal'); if(!m.classList.contains('open')) return '(closed)'; return 'NOTE['+(document.getElementById('evolveRouteNote').hidden?'':document.getElementById('evolveRouteNote').innerText.replace(/\s+/g,' '))+'] ROUTES['+(document.getElementById('evolveRouteList').style.display==='none'?'hidden:':'')+[...document.querySelectorAll('#evolveRouteList .evolve-route-item')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' || ')+'] EXTRA['+[...document.querySelectorAll('#evolveExtraRow button')].map(b=>b.textContent).join(',')+']'; });
const setup = async (battle, hand, raising=null) => { await ev(`(() => { practiceState.turn.phase='main'; practiceState.memory=0; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=${JSON.stringify(battle)}.map(c=>({cards:c,rested:false})); ${me}.raising=${raising?`{cards:${JSON.stringify(raising)},rested:false}`:'null'}; ${me}.hand=${JSON.stringify(hand)}; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel(); evolveRouteModal.classList.remove("open")'); };
// raising {育成} play reduction BT22-079 inherited, once per turn
const eater = 'BT12-085';
await setup([], [eater, eater], ['EX6-006','BT1-010']);
await ev(`appearFromHand(0, ${me}.hand[0])`); await w(); console.log('A', await modal());
await page.click('#evolveRouteList .evolve-route-item'); await w();
console.log('played mem', await ev('practiceState.memory'), 'battle', await ev(`${me}.battle.length`));
await ev(`appearFromHand(0, ${me}.hand[0])`); await w(); console.log('A2 (once used)', await modal());
await ev('evolveRouteModal.classList.remove("open")');
// gate
const opt = 'BT1-090';
await setup([], [opt]); await ev(`appearFromHand(0, ${me}.hand[0])`); await w();
await page.click('#evolveRouteNote .ern-go'); await w(); console.log('B gate open', await modal());
await page.click('#evolveRouteList .evolve-route-item'); await w(); console.log('used ->', await ev(`${me}.battle.map(s=>miniCardName(s.cards[0])).join()`), await ev(`${me}.hand.length`));
// digixros extras
const dx = await find("c.category==='digimon' && /デジクロス/.test(c.effect||'') && c.play_cost");
await setup([], [dx]); await ev(`appearFromHand(0, ${me}.hand[0])`); await w(); console.log('C', await modal());
// tamer evolve via BT18-021
const tgt = 'BT10-009';
await setup([['BT18-021']], [tgt]); await ev(`enterEvolveMode(0, ${me}.hand[0]); performEvolve(${me}.battle[0]);`); await w(); console.log('D', await ev(`cardIndexByNumber.get('BT18-021').level`), await modal());
await page.screenshot({path:'/mnt/user-data/outputs/mock/impl_evo_844.png'});
await browser.close(); console.log(errs);
