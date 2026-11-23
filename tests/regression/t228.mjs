// エンドに入ったとき: ターンプレイヤーの≪急襲≫(ターン終了時のアタック)を、相手の【相手のターン終了時】より先に処理できる(15-4-3-5)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const raid = 'EX12-019';
const oppEnd = 'BT14-051';
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['${raid}'], enteredTurn:-5}]; O.battle=[{cards:['BT1-009','${oppEnd}']},{cards:['BT1-010']}]; practiceState.turn.phase='main'; renderPracticeBoard(); })()`);
await page.waitForTimeout(100); await ev(`(() => { clearEffectQueue(); renderPracticeBoard(); })()`); await page.waitForTimeout(50);
await ev(`(() => { snapshotPracticeState(); practiceState.turn.phase='end'; renderPracticeBoard(); })()`);
await page.waitForTimeout(300);
o.q = await ev(`(() => { const q=getEffectQueue(); return [q.current,...q.pending].filter(Boolean).map(e=>(e.ownerIndex===${pi}?'T':'N')+':'+e.cardNumber+(e.kwAttack?'(kw)':'')).join(','); })()`);
o.first = await ev(`(() => { const q=getEffectQueue(); const e=q.current || getSelectableEffects()[0]; return e ? (e.ownerIndex===${pi}?'T':'N')+(e.kwAttack?'kw':'') : 'none'; })()`);
o.btn = await ev(`(() => { const q=getEffectQueue(); const e=[q.current,...q.pending].find(x=>x&&x.kwAttack); return e ? getEffectHandlers(e).map(h=>h.label).join('/') : 'none'; })()`);
o.ok = o.first === 'Tkw' && /急襲でアタック/.test(o.btn) && /N:/.test(o.q);
console.log(JSON.stringify(o), raid, oppEnd);
await browser.close(); console.log(o.ok ? errs : ['ng']);
