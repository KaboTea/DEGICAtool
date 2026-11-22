// 相手は選んだデジモンをアタックさせる(BT13-077/EX3-024)/ 相手のデジモンを他の相手のデジモンの進化元の下へ(EX10-056/BT12-083)・相手の手札を下へ(EX10-059)/ 育成エリアから移動(P-130)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const H = (num, text, owner) => `getEffectHandlers({ownerIndex:${owner}, stackUid:ensureStackUid(practiceState.players[${owner}].battle[0]), cardNumber:'${num}', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'x', event:'t'})`;
// 1 相手(= 非ターンプレイヤーの効果で、ターンプレイヤーのデジモンをアタックさせる)
o.atk = await ev(`(() => { const T=practiceState.players[${pi}], N=practiceState.players[1-${pi}]; attackState=null;
  N.battle=[{cards:['BT1-009','BT13-077']}]; T.battle=[{cards:['BT1-010'], enteredTurn:-5},{cards:['BT1-015'], enteredTurn:practiceState.turn.count},{cards:['BT1-016'], rested:true, enteredTurn:-5}]; renderPracticeBoard();
  const h=${H('BT13-077', '相手のデジモン1体を選べる。相手は、選んだデジモンをアタックさせる。', `1-${pi}`)}.find(h=>/アタックさせる/.test(h.label)); if(!h) return 'nobtn'; h.run();
  const c=fieldPickMode ? fieldPickMode.candidates.map(st=>T.battle.indexOf(st)).join() : 'nopick'; fieldPickMode.selected=[T.battle[0]]; finishFieldPick();
  const r=c+' atk='+(attackState ? getStackTopCard(attackState.attackerStack).number : 'none')+' view='+(practiceState.viewingIndex===${pi}); cancelTargetModes(); attackState=null; return r; })()`);
o.ok_atk = /^0 atk=BT1-010/.test(o.atk);
// 2 EX10-056: 相手のデジモン(進化元つき)を他の相手のデジモンの下へ(一番上だけ。下のカードは破棄)
await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard(); })()`);
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','EX10-056']}]; O.battle=[{cards:['BT1-009','BT1-010']},{cards:['BT1-015']}]; O.trash=[]; renderPracticeBoard();
  ${H('EX10-056', '相手のデジモン1体を他の相手のデジモンの進化元の下かテイマーの下に置ける。', pi)}.find(h=>/進化元の下/.test(h.label)).run();
  fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); })()`);
await page.waitForTimeout(100);
o.under = await ev(`(() => { const O=practiceState.players[1-${pi}]; fieldPickMode.selected=[fieldPickMode.candidates[0]]; finishFieldPick(); return O.battle.map(st=>st.cards.map(cardEntryNum).join('+')).join(',')+' trash='+O.trash.join(); })()`);
o.ok_under = o.under === 'BT1-010+BT1-015 trash=BT1-009';
// 2b BT12-083: Lv.3以下だけ(テイマーがいなければ+0)
o.lv = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','BT12-083']}]; O.battle=[{cards:['BT1-010']},{cards:['BT1-009','BT2-020']}]; renderPracticeBoard();
  ${H('BT12-083', 'Lv.3以下の相手のデジモン1体を他の相手のデジモンの進化元の下か、相手のテイマーの下に置く。異なる色を持つ自分のテイマー1体ごとに、この効果で選べるLv.+1。', pi)}.find(h=>/進化元の下/.test(h.label)).run();
  const r=fieldPickMode ? fieldPickMode.candidates.map(st=>O.battle.indexOf(st)).join() : 'nopick'; cancelTargetModes(); return r; })()`);
o.ok_lv = o.lv === '0';
// 2c EX10-059: 相手の手札1枚を下へ
o.hand = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','EX10-059']}]; O.battle=[{cards:['BT1-015']}]; O.hand=['BT1-010']; renderPracticeBoard();
  ${H('EX10-059', '相手の手札1枚を見ないで選び、相手のデジモンの進化元の下かテイマーの下に置く。', pi)}.find(h=>/相手の手札1枚/.test(h.label)).run();
  fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); return O.hand.length+' '+O.battle[0].cards.map(cardEntryNum).join('+'); })()`);
o.ok_hand = o.hand === '0 BT1-010+BT1-015';
// 3 P-130 登場時: 育成エリアから移動
o.move = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['P-130']}]; P.raising={cards:['BT1-001','BT1-010']}; renderPracticeBoard();
  const hs=${H('P-130', '育成エリアのLv.3以上の自分のデジモン1体をバトルエリアに移動できる。', pi)}; const h=hs.find(h=>/バトルエリアに移動/.test(h.label)); if(!h) return 'nobtn:'+hs.map(h=>h.label).join('/'); h.run(); return P.battle.length+' '+(P.raising?'r':'-'); })()`);
o.ok_move = o.move === '2 -';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
