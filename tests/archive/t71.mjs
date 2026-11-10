import { page, ev, errs, browser, bar, clickBar, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=500) => page.waitForTimeout(ms);
const v = await ev('practiceState.viewingIndex'); const o = 1-v; const P=(i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-019'],rested:false, enteredTurn:-5, pierceOverride:true, kwGrants:[{type:'fx', text:'【お互いのターン】［ターンに1回］このデジモンがバトルで相手のデジモンを消滅させたとき、相手のセキュリティを上から1枚破棄する。', until:'manual', owner:${v}}]}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:true}]; ${P(o)}.security=['BT1-010', {n:'BT1-090', u:true}]; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel();');
await ev(`declareAttack(${P(v)}.battle[0])`); await w(); console.log('Q0', await ev(`JSON.stringify([getEffectQueue().current&&getEffectQueue().current.text.slice(0,40), getEffectQueue().pending.length])`), await page.evaluate(()=>document.getElementById('effectPanel').innerText.replace(/\s+/g,' ').slice(0,200))); await page.screenshot({path:'atk0.png'});
const id = await ev(`getFxId(${P(o)}.battle[0])`); await page.click(`[data-fxid="${id}"]`).catch(()=>{}); await w();
for (let i=0;i<14;i++) { const b = await bar(); const ab = await autoBtns(); console.log(i, b.slice(0,110), '| auto', ab.join(',')); 
  if (ab.some(x=>/セキュリティ/.test(x))) { await clickAuto('セキュリティ'); await w(); continue; }
  if (ab.length) { console.log('   skip effect'); await ev('finishCurrentEffect(true)'); await w(); continue; }
  if (b==='(no bar)') break;
  const done = await page.evaluate(()=>{ const bs=[...document.querySelectorAll('#attackBarActs button')]; const t=bs.find(b=>/次へ|そのまま消滅|しない|進む|チェックへ|終了|OK|閉じる/.test(b.textContent))||bs[0]; if(!t) return false; t.click(); return t.textContent; }); console.log('   clicked', done); await w(); }
console.log('opp sec', await ev(`JSON.stringify(${P(o)}.security)`), 'trash', await ev(`${P(o)}.trash.join()`));
await browser.close(); console.log(errs);
