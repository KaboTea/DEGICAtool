// お試しユキナモンの見直し(2026-11-24): ST26-01 進化元効果「進化元を持つ相手のデジモンがいない間、特徴「氷雪型」を持つこのデジモンはバトルで消滅しない」(常在)
// BT27-029「このデジモンは≪ブロッカー≫を得て、バトル以外で消滅しない」の耐性ボタン
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const ice = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&/氷雪型/.test(c.type||'')&&c.level===5).number`);
o.imm = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; const out=[];
  P.battle=[{cards:['ST26-01','${ice}']},{cards:['ST26-01','BT1-010']}]; O.battle=[{cards:['BT1-015']}]; renderPracticeBoard();
  out.push(hasBattleDestroyImmunity(P.battle[0]), hasBattleDestroyImmunity(P.battle[1]));
  O.battle=[{cards:['BT1-009','BT1-015']}]; renderPracticeBoard(); out.push(hasBattleDestroyImmunity(P.battle[0]));
  return out.join(); })()`);
o.ok_imm = o.imm === 'true,false,false';
o.btn = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-009','BT27-029']}]; renderPracticeBoard();
  return getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-029', cardName:'x', field:'effect', lineIndex:0, text:'相手のターン終了まで、このデジモンは≪ブロッカー≫を得て、バトル以外で消滅しない。', timing:'進化時', event:'t'}).map(h=>h.label).join(' / '); })()`);
o.ok_btn = /バトル以外で消滅しない/.test(o.btn) && /ブロッカー/.test(o.btn);
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
