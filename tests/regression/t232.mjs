// ≪急襲≫でアタックしている間は、相手の【相手のターン終了時】を出さない。アタックが終わってから出す(11-1-3, 15-4-3-5)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['EX12-019'], enteredTurn:-5}]; O.battle=[{cards:['BT1-009','BT14-051']},{cards:['BT1-010']}]; practiceState.turn.phase='main'; renderPracticeBoard(); })()`);
await page.waitForTimeout(100); await ev(`(() => { clearEffectQueue(); renderPracticeBoard(); })()`); await page.waitForTimeout(50);
await ev(`(() => { snapshotPracticeState(); practiceState.turn.phase='end'; renderPracticeBoard(); })()`);
await page.waitForTimeout(300);
// ≪急襲≫の効果を処理中にして、急襲でアタック
await ev(`(() => { const q=getEffectQueue(); const e=q.current && q.current.kwAttack ? q.current : q.pending.find(x=>x.kwAttack); if (q.current !== e) selectEffect(e.id); })()`);
await page.waitForTimeout(100);
o.atk = await ev(`(() => { const h=getEffectHandlers(getEffectQueue().current).find(h=>/急襲/.test(h.label)); h.run(); return !!attackState; })()`);
await page.waitForTimeout(200);
o.during = await ev(`(() => { const q=getEffectQueue(); return (q.current ? 'cur:'+q.current.cardNumber : 'none')+' sel='+getSelectableEffects().length+' hidden='+document.getElementById('effectPanel').hidden; })()`);
await ev(`endAttack()`); await page.waitForTimeout(300);
o.after = await ev(`(() => { const q=getEffectQueue(); return q.current ? 'cur:'+q.current.cardNumber : 'sel:'+getSelectableEffects().map(e=>e.cardNumber).join(); })()`);
// アタック中に相手のデジモン(【相手のターン終了時】を持つ)が消滅したら、その効果は出ない(15-4-4-3)
await ev(`(() => { clearEffectQueue(); const O=practiceState.players[1-${pi}]; O.battle=[{cards:['BT1-009','BT14-051']},{cards:['BT1-010']}]; practiceState.turn.phase='main'; practiceState.endPhaseAttackUsed=false; renderPracticeBoard(); })()`);
await page.waitForTimeout(100); await ev(`(() => { clearEffectQueue(); renderPracticeBoard(); })()`); await page.waitForTimeout(50);
await ev(`(() => { snapshotPracticeState(); practiceState.turn.phase='end'; renderPracticeBoard(); })()`); await page.waitForTimeout(300);
const has = await ev(`(() => { const q=getEffectQueue(); return [q.current,...q.pending].filter(Boolean).some(e=>e.cardNumber==='BT14-051'); })()`);
await ev(`(() => { const q=getEffectQueue(); q.current=null; attackState={ queueFloor: q.batchSeq, attackerStack: practiceState.players[${pi}].battle[0], defenderOwner: practiceState.players[1-${pi}] }; const O=practiceState.players[1-${pi}]; O.trash.push(...O.battle[0].cards.map(cardEntryNum)); O.battle.splice(0,1); renderPracticeBoard(); })()`);
await ev(`endAttack()`); await page.waitForTimeout(300);
o.gone = await ev(`(() => { const q=getEffectQueue(); return [q.current,...q.pending].filter(Boolean).filter(isEffectEntryValid).map(e=>e.cardNumber).join(); })()`);
o.ok_gone = has && !/BT14-051/.test(o.gone);
o.ok = o.atk === true && o.during === 'none sel=0 hidden=true' && /BT14-051/.test(o.after) && o.ok_gone;
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
