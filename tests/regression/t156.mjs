// v0.95.0: 常在の禁止(アタック/アタックされない/ブロック/対象変更/レスト/メモリー/コスト軽減/効果で登場)の確認
import { page, ev, errs, browser, bar, banner } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const setB = (mine, theirs) => ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=${JSON.stringify(mine)}; O.battle=${JSON.stringify(theirs)}; renderPracticeBoard(); })()`);
// 1 自分のアタックできない(BT2-058)
await setB([{cards:['BT2-058'],rested:false}], []);
await ev(`declareAttack(practiceState.players[${pi}].battle[0])`); await page.waitForTimeout(200);
o.attackConfirm = /🚫/.test(await bar()) && await ev('!attackState');
await page.evaluate(() => [...document.querySelectorAll('#attackBarActs button')].find(b=>/それでも/.test(b.textContent)).click()); await page.waitForTimeout(200);
o.attackForced = await ev('!!attackState'); await ev('endAttack()');
// 2 相手のBT5-032(進化元を持たない相手のデジモン全てはアタックとブロックができない) → 自分の進化元なしデジモン
await setB([{cards:['BT1-010'],rested:false},{cards:['BT1-019','BT1-025'],rested:false}], [{cards:['BT5-032'],rested:false}]);
o.allSubj = await ev(`prohibitionsOn(practiceState.players[${pi}].battle[0],'attack').length===1 && prohibitionsOn(practiceState.players[${pi}].battle[1],'attack').length===0`);
// 3 条件つき BT15-061(相手のデジモンがいない間アタックできない)
await setB([{cards:['BT15-061'],rested:false}], []);
o.condOn = await ev(`prohibitionsOn(practiceState.players[${pi}].battle[0],'attack').length===1`);
await setB([{cards:['BT15-061'],rested:false}], [{cards:['BT1-010'],rested:true}]);
o.condOff = await ev(`prohibitionsOn(practiceState.players[${pi}].battle[0],'attack').length===0`);
// 4 アタックされない(相手のBT5-030 は相手のターンに効く=こちらのターン)
await setB([{cards:['BT1-010'],rested:false}], [{cards:['BT5-030'],rested:true}]);
o.beAttacked = await ev(`prohibitionsOn(practiceState.players[1-${pi}].battle[0],'beAttacked').length===1`);
// 5 対象変更されない AD1-012(進化元)
await setB([{cards:['AD1-012','BT1-025'],rested:false}], [{cards:['BT1-010'],rested:true}]);
await ev(`declareAttack(practiceState.players[${pi}].battle[0])`); await page.waitForTimeout(200);
await ev(`retargetAttack(practiceState.players[1-${pi}].battle[0])`); await page.waitForTimeout(200);
o.retarget = /🚫/.test(await bar()) && await ev('attackState.targetType !== "digimon"');
await ev('endAttack()');
// 6 BT4-035 ブロックされない: ブロッカー候補から外れる
await setB([{cards:['BT4-035'],rested:false}], []);
o.beBlocked = await ev(`(() => { const s={cards:['BT1-010'],rested:false}; practiceState.players[1-${pi}].battle=[s]; attackState={attackerStack:practiceState.players[${pi}].battle[0]}; const r=blockProhibitionsFor(s).length===1; attackState=null; return r; })()`);
// 7 コスト軽減の禁止: BT8-071 お互いは支払う登場コストをマイナスできない
await setB([{cards:['BT8-071'],rested:false},{cards:['BT1-010','BT1-010','BT1-010','EX5-012']}], []);
o.noReduce = await ev(`collectCostReductions('play', cardIndexByNumber.get('EX5-012'), {pi:${pi}, source:'hand'}).every(r=>r.holds==null && /マイナスできない/.test(r.label))`);
// 8 メモリー: BT25-079 があるとき、デジモンの効果のメモリー+1は確認
await setB([{cards:['BT25-079'],rested:false}], []);
const mem0 = await ev('practiceState.memory');
await ev(`memoryHandlersFor({ownerIndex:${pi}, cardNumber:'BT1-010', field:'effect', cardName:'x', text:'【登場時】メモリー+1。'})[0].run()`); await page.waitForTimeout(200);
o.memConfirm = /🚫/.test(await bar()) && (await ev('practiceState.memory')) === mem0;
// 9 効果で登場の警告: BT14-009
await setB([{cards:['BT14-009'],rested:false}], []);
o.playByEffect = await ev(`(() => { const s={cards:['BT1-010'],rested:false}; practiceState.players[${pi}].battle.push(s); s.entryInfo={byEffect:true}; return prohibitionsForPlayer(${pi},'playByEffect').length===1; })()`);
// 10 BT10-042 attackThis
await setB([{cards:['BT1-010','BT1-025'],rested:false}], [{cards:['BT10-042'],rested:true}]);
o.attackThis = await ev(`(() => { const a=practiceState.players[${pi}].battle[0]; const r = prohibitionsOn(a,'attackThis'); return r.length===1 && r[0].holder===practiceState.players[1-${pi}].battle[0]; })()`) ;
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
