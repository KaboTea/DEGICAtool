// 2026-11-19: 「相手のデジモンの進化元が効果で破棄されたとき」(EX11-057) / 条件+特徴の付与(EX11-016 ≪貫通≫≪Sアタック+1≫)/ 「アクティブ状態の相手のデジモンにもアタックできる」(EX11-002)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(80); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard(); })()`); await page.waitForTimeout(40); };
// 1 進化元の破棄 → EX11-057 が出る / 進化元が場を離れるときは出ない
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['EX11-057']}]; O.battle=[{cards:['BT1-009','BT1-010','BT1-015']}]; O.trash=[]; renderPracticeBoard(); })()`); await settle();
await ev(`(() => { const O=practiceState.players[1-${pi}]; snapshotPracticeState(); removeCardFromStackAt(O.battle[0], 0, 'trash', undefined, () => renderPracticeBoard()); renderPracticeBoard(); })()`);
await page.waitForTimeout(300);
const q = () => ev(`(() => { const q=getEffectQueue(); return [q.current,...q.pending].filter(Boolean).map(e=>e.cardNumber).join(); })()`);
o.disc = await q();
o.ok_disc = /EX11-057/.test(o.disc);
await settle();
await ev(`(() => { const P=practiceState.players[${pi}]; snapshotPracticeState(); P.battle[0].cards.unshift('BT1-009'); P.battle[0].cards.unshift('BT1-010'); renderPracticeBoard(); })()`); await settle();
await ev(`(() => { const P=practiceState.players[${pi}]; snapshotPracticeState(); removeCardFromStackAt(P.battle[0], 0, 'trash', undefined, () => renderPracticeBoard()); renderPracticeBoard(); })()`);
await page.waitForTimeout(300);
o.own = await q();
o.ok_own = !/EX11-057/.test(o.own); // 自分のデジモン(テイマーの下)の進化元は「相手の」ではない
// 2 付与
const ice = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&/氷雪型/.test(c.type||'')&&c.level===5).number`);
o.kw = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; O.battle=[{cards:['BT1-009']}]; P.battle=[{cards:['EX11-016','${ice}']},{cards:['EX11-002','${ice}']},{cards:['EX11-016','BT1-010']}]; renderPracticeBoard();
  const a=[hasInnateOrLinkedKeyword(P.battle[0],'貫通'), effectiveSAttackBonus(P.battle[0]), canAttackActiveDigimon(P.battle[1]), hasInnateOrLinkedKeyword(P.battle[2],'貫通')].join();
  O.battle=[{cards:['BT1-009','BT1-010']}]; renderPracticeBoard();
  return a+' | '+[hasInnateOrLinkedKeyword(P.battle[0],'貫通'), effectiveSAttackBonus(P.battle[0]), canAttackActiveDigimon(P.battle[1])].join(); })()`);
o.ok_kw = o.kw === 'true,1,true,false | false,0,false';
// 3 松田啓人(EX2-056): 名称に「グラウモン」を含むデジモンに進化したら≪進撃≫を持つ
o.adv = await ev(`(() => { const P=practiceState.players[${pi}]; const all=[...cardIndexByNumber.values()];
  const g=all.find(c=>c.category==='digimon'&&/グラウモン/.test(c.name)&&!/進撃/.test(c.effect||'')).number, x=all.find(c=>c.category==='digimon'&&c.level===4&&!/グラウモン|デュークモン/.test(c.name)&&!/進撃/.test(c.effect||'')).number;
  P.battle=[{cards:['EX2-056']},{cards:['BT1-009',g]},{cards:['BT1-009',x]}]; renderPracticeBoard();
  const a=[hasAdvanceKeyword(P.battle[1]), hasAdvanceKeyword(P.battle[2])].join(); P.battle.shift(); renderPracticeBoard(); return a+'|'+hasAdvanceKeyword(P.battle[0]); })()`);
o.ok_adv = o.adv === 'true,false|false';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
