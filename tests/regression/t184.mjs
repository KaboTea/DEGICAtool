// v0.97.11: 「セキュリティの内容を全て確認して、その中の赤か黄のテイマーカード1枚をコストを支払わずに登場できる。登場したなら、≪リカバリー+1《デッキ》≫。その後、シャッフル」(BT13-012)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const tm = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='tamer' && (c.color||[]).includes('red')).number`);
o.h = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT13-012']}]; P.hand=[]; P.library=['BT1-001','BT1-002'];
  P.security=['BT1-010', {n:'${tm}', u:1}, 'BT1-010']; practiceState.memory=3; renderPracticeBoard(); const c=cardIndexByNumber.get('BT13-012'); const line=c.effect.split('\\n').find(l=>/セキュリティの内容を全て確認/.test(l));
  const h=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT13-012', cardName:c.name, field:'effect', lineIndex:1, text:line, timing:'x', event:'t'}).find(h=>/セキュリティを確認して登場/.test(h.label));
  if (!h) return 'nohandler'; h.run(); return h.label; })()`);
o.oneOk = await ev(`[...document.querySelectorAll('#detailBody .eep-go')].length === 1`);
await page.evaluate(() => document.querySelector('#detailBody .eep-go').click());
await page.waitForTimeout(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && /効果で登場/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(400);
o.played = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; return P.battle.some(s=>cardEntryNum(s.cards[s.cards.length-1])==='${tm}') && P.security.length===3 && P.library.length===1 && P.security.every(x=>typeof x==='string') && practiceState.memory===3; })()`);
const ng = Object.entries(o).filter(([k, x]) => k !== 'h' && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
