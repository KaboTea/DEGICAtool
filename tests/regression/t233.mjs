// ED01-10 雪片の絆の≪ディレイ≫「特徴「アリシオン」を持つ青の自分のデジモン1体を選び、進化元枚数が選んだデジモンより少ない相手のデジモン1体に選んだデジモンでアタックする」
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const al = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&/アリシオン/.test(c.type||'')&&c.color.length===1&&c.color[0]==='blue').number`);
o.c1 = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; attackState=null; practiceState.viewingIndex=${pi};
  P.battle=[{cards:['BT1-009','BT1-009','${al}'], enteredTurn:-5},{cards:['BT1-010'], enteredTurn:-5},{cards:['ED01-10']}]; O.battle=[{cards:['BT1-015']},{cards:['BT1-009','BT1-009','BT1-009','BT1-010']}]; renderPracticeBoard();
  const t='≪ディレイ≫（置いた次のターン以降にこのカードを破棄することで、効果を発揮する）\\n・特徴「アリシオン」を持つ青の自分のデジモン1体を選び、進化元枚数が選んだデジモンより少ない相手のデジモン1体に選んだデジモンでアタックする。この効果では、アクティブ状態の相手のデジモンにもアタックできる。';
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[2]), cardNumber:'ED01-10', cardName:'雪片の絆', field:'effect', lineIndex:1, text:t, timing:'自分のターン終了時', event:'t'}).find(h=>/相手のデジモンにアタック/.test(h.label));
  if(!h) return 'nobtn'; h.run(); return fieldPickMode ? fieldPickMode.candidates.map(st=>P.battle.indexOf(st)).join() : 'nopick'; })()`);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(150);
o.c2 = await ev(`fieldPickMode ? fieldPickMode.candidates.map(st=>practiceState.players[1-${pi}].battle.indexOf(st)).join() : 'nopick'`);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(150);
o.atk = await ev(`(() => { const r = attackState ? attackState.targetType+':'+getStackTopCard(attackState.targetStack).number : 'noatk'; cancelTargetModes(); attackState=null; return r; })()`);
o.ok = o.c1 === '0' && o.c2 === '0' && o.atk === 'digimon:BT1-015';
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
