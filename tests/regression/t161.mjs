// v0.96.3: セキュリティを確認して登場/登場コスト合計Nまで/ST2-14のロック/「【登場時】効果は発揮しない」の常在
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const H = (num, line) => `getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(practiceState.players[${pi}].battle[0]), cardNumber:'${num}', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(line)}, timing:(/【([^】]+)】/.exec(${JSON.stringify(line)})||[])[1], event:'t'})`;
const clickGo = async () => { await page.waitForTimeout(250); await page.evaluate(() => document.querySelector('.eep-row:not(.eep-ng) .eep-go').click()); await page.waitForTimeout(250); await page.evaluate(() => { const b=[...document.querySelectorAll('#evolveRouteModal button')].find(x=>/効果で登場/.test(x.textContent)); b && b.click(); }); await page.waitForTimeout(300); };
// 1 セキュリティから(BT15-092: 黄のLv.4以下)
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-010']}]; P.security=['BT1-019','BT1-053','BT1-010','BT16-029']; renderPracticeBoard(); })()`);
await ev(`${H('BT15-092','【メイン】自分のセキュリティを全て確認する。その中の黄のLv.4以下のデジモンカード1枚をコストを支払わずに登場できる。その後、自分のセキュリティをシャッフルする。')}.find(h=>/セキュリティを確認/.test(h.label)).run()`);
o.secPicker = await page.evaluate(() => [...document.querySelectorAll('.eep-row:not(.eep-ng)')].map(r=>r.innerText.split('\n')[0]).join('|'));
await clickGo();
o.secAfter = await ev(`[practiceState.players[${pi}].battle.map(s=>cardEntryNum(s.cards[0])), practiceState.players[${pi}].security.length]`);
// 2 合計コスト(BT26-081の書き方を手札で): 登場コスト3のカード2枚で残り2
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-010']}]; P.hand=['BT1-010','BT16-029','BT1-019','BT14-018']; renderPracticeBoard(); })()`);
await ev(`${H('X','【登場時】自分の手札/トラッシュから、Lv.3のデジモンカードを登場コスト合計6まで、コストを支払わず登場できる。')}.find(h=>/合計6/.test(h.label)).run()`);
await clickGo();
o.continueAsk = /続けて登場/.test(await bar());
await page.evaluate(() => [...document.querySelectorAll('#attackBarActs button')].find(b=>/続けて/.test(b.textContent)).click());
await clickGo();
o.totalAfter = await ev(`[practiceState.players[${pi}].battle.length, practiceState.players[${pi}].hand.map(cardEntryNum)]`);
o.budgets = await ev(`${H('EX13-035','【登場時】【進化時】自分の手札/トラッシュから、名称に「チューモン」/「スカモン」/「エテモン」を含むデジモンカード2枚までを登場コスト合計6まで、コストを支払わず登場できる。自分のトラッシュから、名称に「チューモン」/「スカモン」/「エテモン」を含むカード10枚をデッキの下に戻すことで、この効果の登場コスト上限+6。')}.map(h=>h.label).filter(l=>/🧮/.test(l))`);
// 3 ST2-14 ロック
o.st214 = await ev(`${H('ST2-14','【メイン】進化元を持たない相手のデジモン1体を選ぶ。そのデジモンは次の相手のターン終了時までアタックとブロックができない。')}.map(h=>h.label)`);
// 4 EX8-029 相手のデジモン全ての【登場時】効果は発揮しない / BT10-042
o.noTiming = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-010','EX8-029']}]; O.battle=[{cards:['BT1-010']}]; practiceState.memory = 0; return [parseStaticProhibitions(cardIndexByNumber.get('EX8-029').effect).filter(r=>r.key==='noTiming').map(r=>r.timings.join()+'/'+r.cond), prohibitionsOn(O.battle[0],'noTiming').length, prohibitionsOn(P.battle[0],'noTiming').length]; })()`);
o.bt10042 = await ev(`parseStaticProhibitions(cardIndexByNumber.get('BT10-042').effect).map(r=>r.key+':'+(r.timings||[]).join())`);
const chk = {
  secPicker: /ダルクモン/.test(o.secPicker) && !/ギルモン|アグモンLv\.3 \(上から4/.test(o.secPicker.replace('アグモンLv.3 (上から1枚目)','')),
  secAfter: o.secAfter[0].includes('BT1-053') && o.secAfter[1] === 3,
  continueAsk: o.continueAsk === true, totalAfter: o.totalAfter[0] === 3 && !o.totalAfter[1].includes('BT1-010') && !o.totalAfter[1].includes('BT16-029'),
  budgets: o.budgets.length === 2, st214: o.st214.some(x => /アタックできない・ブロックできない/.test(x)),
  noTiming: o.noTiming[1] === 1 && o.noTiming[2] === 0, bt10042: o.bt10042.includes('noTiming:アタック時,進化時'),
};
const ng = Object.entries(chk).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(chk));
await browser.close(); console.log(ng.length ? ng : errs);
