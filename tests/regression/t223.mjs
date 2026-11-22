// BT27-092 進化元効果(自分のデジモンを選んで相手と一緒に消滅)/ BT27-035「相手の手札が7枚になるように見ないでデッキの下に戻すことで」/ テイマーの下のカードに進化(BT19-008・BT27-104)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const H = (num, field, text, holderIdx = 0) => `getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(practiceState.players[${pi}].battle[${holderIdx}]), cardNumber:'${num}', cardName:'x', field:'${field}', lineIndex:0, text:${JSON.stringify(text)}, timing:'x', event:'t'})`;
// 3 BT27-092: このデジモン(DP)以下の相手と、選んだ自分のデジモンを消滅
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT27-092','BT1-015']},{cards:['BT1-010']}]; O.battle=[{cards:['BT1-010']},{cards:['BT2-020']}]; P.trash=[]; O.trash=[]; renderPracticeBoard(); clearEffectQueue(); practiceState.viewingIndex=${pi}; })()`);
await ev(`${H('BT27-092', 'inherited', '自分のデジモン1体を選ぶことで、このデジモンのDP以下の相手のデジモン1体と選んだ自分のデジモンを消滅させる。')}.find(h=>/一緒に消滅/.test(h.label)).run()`);
await page.waitForTimeout(100);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[${pi}].battle[1]]; finishFieldPick(); })()`); await page.waitForTimeout(150);
o.oppCands = await ev(`fieldPickMode ? fieldPickMode.candidates.map(st=>getStackTopCard(st).number).join() : 'nopick'`);
await ev(`(() => { fieldPickMode.selected=[fieldPickMode.candidates[0]]; finishFieldPick(); })()`); await page.waitForTimeout(300);
o.bar = await page.evaluate(() => [...document.querySelectorAll('#attackBarActs button')].map(x => x.textContent.trim()).join('|'));
for (let i = 0; i < 3; i++) { await page.evaluate(() => { const b = [...document.querySelectorAll('#attackBarActs button')].find(x => /消滅させる|そのまま|進める/.test(x.textContent)); b && b.click(); }); await page.waitForTimeout(200); }
o.destroy = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; return P.battle.length+'/'+O.battle.length; })()`);
o.ok_destroy = o.oppCands === 'BT1-010' && o.destroy === '1/1';
// 4 BT27-035 の代償
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','BT27-035']}]; O.hand=Array(9).fill('BT1-010'); O.library=[]; O.security=['BT1-015','BT1-016']; renderPracticeBoard(); clearEffectQueue(); })()`);
o.btns = await ev(`${H('BT27-035', 'effect', '相手の手札が8枚以上なら、相手の手札が7枚になるように見ないでデッキの下に戻すことで、相手のセキュリティを上から1枚デッキの下に戻す。')}.map(h=>h.label).join(' / ')`);
await ev(`${H('BT27-035', 'effect', '相手の手札が8枚以上なら、相手の手札が7枚になるように見ないでデッキの下に戻すことで、相手のセキュリティを上から1枚デッキの下に戻す。')}.find(h=>/代償/.test(h.label)).run()`);
await page.waitForTimeout(150);
o.hand = await ev(`practiceState.players[1-${pi}].hand.length+'/'+practiceState.players[1-${pi}].library.length`);
o.ok_cost = o.hand === '7/2' && /セキュリティ/.test(o.btns);
// 5 BT19-008: 自分のテイマーの下の「オメガシャウトモン」に進化 / BT27-104: このテイマーの下の「ロイヤルナイツ」に
const omega = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='オメガシャウトモン' && c.category==='digimon').number`);
await ev(`(() => { const P=practiceState.players[${pi}]; practiceState.memory=0; P.battle=[{cards:['BT1-009','BT19-008']},{cards:[{n:'${omega}',d:true},'BT27-104']}]; renderPracticeBoard(); clearEffectQueue(); })()`);
await ev(`${H('BT19-008', 'effect', 'このデジモンを自分のテイマーの下の「オメガシャウトモン」にコストを支払わずに進化できる。')}.find(h=>/テイマーの下から進化/.test(h.label)).run()`);
await page.waitForTimeout(150);
o.list = await page.evaluate(() => [...document.querySelectorAll('#detailBody .cmp-row, #detailBody .evolve-route-item, #detailBody [data-i]')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 3).join(' | '));
await page.evaluate(() => { const r = document.querySelector('#detailBody .cmp-row, #detailBody [data-i]'); r && r.click(); const b = [...document.querySelectorAll('#detailBody button')].find(x => /進化/.test(x.textContent) && !x.disabled); b && b.click(); });
await page.waitForTimeout(250);
await page.evaluate(() => { const b = document.querySelector('#evolveRouteModal.open .evolve-route-item:not(.eri-pay)'); b && b.click(); });
await page.waitForTimeout(300);
o.evo = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.map(st=>st.cards.map(cardEntryNum).join('+')).join(' , '); })()`);
o.ok_evo = o.evo === `BT1-009+BT19-008+${omega} , BT27-104`;
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
