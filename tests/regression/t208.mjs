// 三叉路の魔女(BT24-086)の進化元効果「特徴に「X抗体」/〜を持つこのデジモンは≪連携≫と≪再起動≫を得る」
// ジャスティモンX抗体(EX8-054)「進化元にある名称に「ジャスティモン」を含むデジモンカード1枚の【進化時】効果1つをこのデジモンの効果として発揮」
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT24-086','BT19-064','EX8-054']},{cards:['BT24-086','BT1-010','BT1-015']}]; renderPracticeBoard(); })()`);
await page.waitForTimeout(80); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard(); })()`);
o.kw = await ev(`(() => { const P=practiceState.players[${pi}]; return [hasInnateOrLinkedKeyword(P.battle[0],'連携'), hasInnateOrLinkedKeyword(P.battle[0],'再起動'), hasInnateOrLinkedKeyword(P.battle[1],'再起動')].join(); })()`);
o.ok_kw = o.kw === 'true,true,false'; // X抗体を持たないグレイモンには付かない
await ev(`(() => { const P=practiceState.players[${pi}]; const tr=collectStackTriggers(P.battle[0], ${pi}, 'battle', ['アタック時'], {event:'t'})[0]; enqueueEffects([], [tr]); renderEffectPanel(); })()`);
await page.waitForTimeout(150);
await ev(`effectHandlersWithConds(getEffectQueue().current).handlers.find(h=>/進化元の/.test(h.label)).run()`); await page.waitForTimeout(150);
o.rows = await page.evaluate(() => [...document.querySelectorAll('#detailBody .eep-row')].map(r => r.textContent.replace(/\s+/g, '').slice(0, 20)).join(' / '));
await page.evaluate(() => { const r=[...document.querySelectorAll('#detailBody .eep-row')].find(x=>/ブリッツアーム/.test(x.textContent)); r && r.click(); const g=document.querySelector('#detailBody .eep-go'); g && g.click(); });
await page.waitForTimeout(150);
o.choose = await page.evaluate(() => [...document.querySelectorAll('#attackBarActs button')].map(b => b.textContent.trim()).join(' / '));
await page.evaluate(() => document.querySelector('#attackBarActs button').click()); await page.waitForTimeout(200);
o.q = await ev(`(() => { const q=getEffectQueue(); return q.pending.filter(e=>e.cardNumber==='BT19-064').map(e=>e.timing+':'+e.stackUid).length; })()`);
o.ok_use = /ブリッツアーム/.test(o.rows) && /ブロッカー/.test(o.choose) && o.q === 1;
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
