// 「このデジモンの進化元から、「ベムモン」がデッキの下に戻ったとき」(スナッチモンの進化元効果): ラグナモンの「離れない」でベムモンを戻すと出る
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
await ev(`(() => { const P=practiceState.players[${pi}]; practiceState.viewingIndex=${pi}; P.battle=[{cards:['BT21-056','BT21-056','BT21-056','BT21-056','BT18-065','BT21-062'], rested:true}]; renderPracticeBoard(); })()`);
await page.waitForTimeout(80); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard(); })()`); await page.waitForTimeout(50);
// ベムモン4枚をデッキの下へ(ラグナモンの「離れない」の代償と同じ動き)
await ev(`(() => { const P=practiceState.players[${pi}]; const st=P.battle[0]; snapshotPracticeState(); st.cards.splice(0, 4).forEach(x => P.library.push(cardEntryNum(x))); renderPracticeBoard(); })()`);
await page.waitForTimeout(300);
o.q = await ev(`(() => { const q=getEffectQueue(); return [q.current, ...q.pending].filter(Boolean).map(e=>e.cardNumber+'/'+e.event).join(); })()`);
o.btns = await ev(`(() => { const q=getEffectQueue(); const e=[q.current, ...q.pending].filter(Boolean).find(e=>e.event==='matToDeck'); return e ? effectHandlersWithConds(e).handlers.map(h=>h.label).join(' | ') : ''; })()`);
// 進化元からトラッシュへ(デッキではない)なら出ない
await ev(`(() => { clearEffectQueue(); const P=practiceState.players[${pi}]; P.battle=[{cards:['BT21-056','BT21-058','BT21-062']}]; renderPracticeBoard(); })()`); await page.waitForTimeout(80);
await ev(`(() => { clearEffectQueue(); renderPracticeBoard(); const P=practiceState.players[${pi}]; P.battle[0].cards.splice(0,1).forEach(x=>P.trash.push(cardEntryNum(x))); renderPracticeBoard(); })()`); await page.waitForTimeout(300);
o.noq = await ev(`(() => { const q=getEffectQueue(); return [q.current, ...q.pending].filter(Boolean).filter(e=>e.event==='matToDeck').length; })()`);
o.ok = /BT18-065\/matToDeck/.test(o.q) && /アクティブ/.test(o.btns) && /ブロッカー/.test(o.btns) && o.noq === 0;
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
