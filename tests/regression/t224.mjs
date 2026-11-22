// アタック先の変更の絞り込み(BT27-013 自分の「クロニクル」/ BT27-022 最も進化元枚数の少ないアクティブの相手)/ BT27-018「DP8000ごとに、以下の効果」の回数
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
// 2 BT27-022(攻撃側の効果): 相手(防御側)の、アクティブで進化元が一番少ないデジモン
o.r022 = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}];
  P.battle=[{cards:['BT27-022','BT1-015']}]; O.battle=[{cards:['BT1-009','BT1-010']},{cards:['BT1-016']},{cards:['BT1-015'], rested:true},{cards:['BT1-009','BT1-009','BT1-010']}]; renderPracticeBoard();
  attackState={ attackerStack:P.battle[0], defenderOwner:O, targetType:'player' };
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-022', cardName:'x', field:'inherited', lineIndex:0, text:'アタックの対象を最も進化元枚数の少ないアクティブ状態の相手のデジモン1体に変更できる。', timing:'アタック時', event:'t'}).find(h=>/対象を変更/.test(h.label));
  if(!h) return 'nobtn'; h.run(); const r=fieldPickMode ? fieldPickMode.candidates.map(st=>O.battle.indexOf(st)).join() : 'nopick'; cancelTargetModes(); attackState=null; return r; })()`);
o.ok_022 = o.r022 === '1';
// 1 BT27-013(守る側の進化元効果): 特徴「クロニクル」を持つ自分のデジモン
const chron = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&/クロニクル/.test(c.type||'')).number`);
o.r013 = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}];
  P.battle=[{cards:['BT1-015']}]; O.battle=[{cards:['BT27-013','${chron}']},{cards:['BT1-010']}]; renderPracticeBoard();
  attackState={ attackerStack:P.battle[0], defenderOwner:O, targetType:'player' };
  const h=getEffectHandlers({ownerIndex:1-${pi}, stackUid:ensureStackUid(O.battle[0]), cardNumber:'BT27-013', cardName:'x', field:'inherited', lineIndex:0, text:'アタックの対象を特徴「クロニクル」を持つ自分のデジモン1体に変更できる。', timing:'相手のターン', event:'t'}).find(h=>/対象を変更/.test(h.label));
  if(!h) return 'nobtn'; h.run(); const r=fieldPickMode ? fieldPickMode.candidates.map(st=>O.battle.indexOf(st)).join() : 'nopick'; cancelTargetModes(); attackState=null; return r; })()`);
o.ok_013 = o.r013 === '0';
// 3 BT27-018: DP16000 → 2回
o.r018 = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-009','BT27-018'], dpModifier: 16000 - (cardIndexByNumber.get('BT27-018').dp||0)}]; renderPracticeBoard();
  return getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-018', cardName:'x', field:'effect', lineIndex:0, text:'このデジモンのDP8000ごとに、以下の効果を発揮できる。\\n・最もDPの低い相手のデジモン1体を消滅させる。', timing:'進化時', event:'t'}).map(h=>h.label).join(' / '); })()`);
o.ok_018 = /今は2回/.test(o.r018);
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
