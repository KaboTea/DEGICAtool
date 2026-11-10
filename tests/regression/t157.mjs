// v0.95.1: 期間つきの禁止のボタン(ブロックされない/アタックされない/対象変更されない/バトルでは消滅しない/効果で登場できない)
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-010','BT1-025'],rested:false}]; O.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-010'],rested:true}]; renderPracticeBoard(); })()`);
const hs = (num, line, field) => ev(`(() => { const P=practiceState.players[${pi}]; return effectHandlersWithConds({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:'x', field:'${field||'effect'}', lineIndex:0, text:${JSON.stringify(line)}, timing:(/【([^】]+)】/.exec(${JSON.stringify(line)})||[])[1], event:'t'}).handlers.map(h=>h.label); })()`);
const run = (num, line, re, field) => ev(`(() => { const P=practiceState.players[${pi}]; const h = effectHandlersWithConds({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:'x', field:'${field||'effect'}', lineIndex:0, text:${JSON.stringify(line)}, timing:(/【([^】]+)】/.exec(${JSON.stringify(line)})||[])[1], event:'t'}).handlers.find(h=>new RegExp(${JSON.stringify(re)}).test(h.label)); h.run(); })()`);
o.l_blocked = await hs('BT14-020', '【自分のメインフェイズ開始時】相手のデジモン1体の進化元を選んで1枚破棄する。ターン終了まで、このデジモンはブロックされない。');
o.l_attacked = await hs('P-086', '【登場時】青の自分のテイマーがいるとき、次の相手のターン終了まで、自分のデジモン1体はアタックされない。');
o.l_retarget = await hs('BT13-029', '【アタック時】相手の手札が8枚以上なら、このターンの間、このデジモンのアタックの対象は変更されない。');
o.l_battle = await hs('BT16-018', '【登場時】【進化時】相手のターン終了まで、自分のデジモン1体はバトルでは消滅しない。');
o.l_link = await hs('BT23-021', '【リンク時】相手のターン終了まで、このデジモンはバトルで消滅しない。', 'link');
o.l_play = await hs('BT23-014', '【登場時】【進化時】相手のターン終了まで、相手はトラッシュから、デジモンとテイマーを効果で登場できない。');
o.l_play2 = await hs('EX7-014', '【進化時】相手のターン終了まで、相手はDP6000以下のデジモンを登場できず、移動できない。');
o.l_play3 = await hs('BT8-097', '【メイン】DP6000以下の相手のデジモン全てを消滅させる。次の相手のターン終了時まで、相手は効果でデジモンを登場できない。');
// ブロックされない を付けてブロック候補から外れる
await run('BT14-020', '【自分のメインフェイズ開始時】ターン終了まで、このデジモンはブロックされない。', 'ブロックされない');
o.blockedResist = await ev(`(() => { const a=practiceState.players[${pi}].battle[0]; attackState={attackerStack:a}; const r=blockProhibitionsFor(practiceState.players[1-${pi}].battle[0]).length===1; attackState=null; return r && hasResist(a,'noBeBlocked'); })()`);
// 対象変更されない
await run('BT13-029', '【アタック時】このターンの間、このデジモンのアタックの対象は変更されない。', '変更されない');
await ev(`declareAttack(practiceState.players[${pi}].battle[0])`); await page.waitForTimeout(200);
await ev(`retargetAttack(practiceState.players[1-${pi}].battle[1])`); await page.waitForTimeout(200);
o.retargetConfirm = /🚫/.test(await bar());
await ev('endAttack()');
// 登場制限(期間つき)を付ける → 相手が効果で登場すると警告対象
await run('BT8-097', '【メイン】次の相手のターン終了時まで、相手は効果でデジモンを登場できない。', '🚫');
o.timedRestrict = await ev(`restrictionsFor(1-${pi}, 'noPlayByEffect').length===1 && restrictionsFor(${pi}, 'noPlayByEffect').length===0`);
const has = (k, re) => { o[k] = Array.isArray(o[k]) && o[k].some(x => re.test(x)); };
has('l_blocked', /ブロックされない/); has('l_attacked', /アタックされない/); has('l_retarget', /変更されない/); has('l_battle', /バトルで消滅しない/); has('l_link', /バトルで消滅しない/);
has('l_play', /効果で登場不可/); has('l_play2', /登場不可\(DP条件\)/); has('l_play3', /効果で登場不可/);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
