import { page, ev, errs, browser } from '../head.mjs';
const w = (ms=400) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const find = (expr) => ev(`[...cardIndexByNumber.values()].find(c=>${expr})?.number`);
const modal = () => page.evaluate(() => { const m=document.getElementById('evolveRouteModal'); if(!m.classList.contains('open')) return '(closed)'; return document.getElementById('evolveRouteSubtitle').textContent+' | '+[...document.querySelectorAll('#evolveRouteList .evolve-route-item')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' || '); });
const body = () => page.evaluate(()=>document.getElementById('detailBody').innerText.replace(/\s+/g,' ').slice(0,240));
const H = (num, holderIdx) => ev(`(() => { const c=cardIndexByNumber.get('${num}'); const e={ownerIndex:practiceState.viewingIndex, cardNumber:c.number, cardName:c.name, text:c.effect+'\\n'+(c.inherited||''), stackUid: ${holderIdx==null?'null':`ensureStackUid(${me}.battle[${holderIdx}])`}}; const f = e.stackUid ? findStackByUid(e.stackUid) : null; window.__h=[...playFromHandHandlersFor(e, f&&f.stack), ...toHandFromZoneHandlersFor(e, f&&f.stack)]; return window.__h.map(h=>h.label).join(' / '); })()`);
const takato = await find("c.name==='松田啓人'"); const gil = await find("c.name==='ギルモン'");
const setup = (battle, hand=[], trash=[]) => ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=${JSON.stringify(battle)}.map(c=>({cards:c,rested:false})); ${me}.hand=${JSON.stringify(hand)}; ${me}.trash=${JSON.stringify(trash)}; clearEffectQueue(); renderPracticeBoard(); })()`);
// A: sources play (AD1-003)
await setup([[takato, gil, 'AD1-003']]); await w();
console.log('A', await H('AD1-003', 0));
const si = await ev(`window.__h.findIndex(h=>/進化元から登場/.test(h.label))`);
await ev(`window.__h[${si}].run()`); await w(); console.log('A picker', await body());
await page.click('.eep-go'); await w(); console.log('A modal', await modal());
await page.click('#evolveRouteList .evolve-route-item'); await w();
console.log('A result', await ev(`${me}.battle.map(s=>s.cards.map(x=>miniCardName(cardEntryNum(x))).join('>')).join(' | ')`));
// B: tamer-under play (BT10-089)
const dorulu = await find("c.name==='ドルルモン'");
await setup([['BT10-089'], [dorulu, 'BT10-087']], []); await w();
console.log('B', await H('BT10-089', 0));
await ev(`window.__h[window.__h.findIndex(h=>/テイマーの下から登場/.test(h.label))].run()`); await w(); console.log('B picker', await body());
await page.click('.eep-go'); await w(); await page.click('#evolveRouteList .evolve-route-item'); await w();
console.log('B result', await ev(`${me}.battle.map(s=>s.cards.map(x=>miniCardName(cardEntryNum(x))).join('>')).join(' | ')`));
// C: trash -> hand (BT10-012)
const xh = await find("c.category==='digimon' && /クロスハート/.test(c.type||'')");
await setup([['BT10-012']], [], [xh, xh, 'BT1-010']); await w();
console.log('C', await H('BT10-012', 0));
await ev('window.__h[0].run()'); await w(); await page.click('.cmp-all'); await w(); await page.click('.cmp-act'); await w();
console.log('C result hand', await ev(`${me}.hand.map(miniCardName).join()`), 'trash', await ev(`${me}.trash.length`));
// D: link play BT22-075
await setup([['BT22-075']]); await ev(`${me}.battle[0].links=['${gil}']`); await w();
console.log('D', await H('BT22-075', 0));
await browser.close(); console.log(errs);
