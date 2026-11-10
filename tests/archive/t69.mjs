import { page, ev, errs, browser, autoBtns, clickAuto, bar } from '../head.mjs';
const w = (ms=500) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const op='practiceState.players[1-practiceState.viewingIndex]';
console.log(await ev(`JSON.stringify(parseEffectGrants(cardIndexByNumber.get('BT12-065').effect))`));
console.log('count', await ev(`[...cardIndexByNumber.values()].reduce((a,c)=>a+['effect','inherited','security_effect'].reduce((b,f)=>b+parseEffectGrants(c[f]||'').length,0),0)`));
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['BT12-065'],rested:false}]; ${op}.battle=[{cards:['BT1-010'],rested:false, enteredTurn:-5}]; clearEffectQueue(); renderPracticeBoard(); })()`); await w(); await ev('clearEffectQueue(); renderEffectPanel();');
const line = await ev(`cardIndexByNumber.get('BT12-065').effect.split('\\n').find(l=>/効果を与える/.test(l))`);
await ev(`(() => { clearEffectQueue(); enqueueEffects([], [{ownerIndex: practiceState.viewingIndex, stackUid: ensureStackUid(${me}.battle[0]), cardNumber:'BT12-065', cardName:'x', field:'effect', lineIndex:1, text:${JSON.stringify(line)}, timing:'登場時', event:'t'}]); renderEffectPanel(); })()`); await w();
console.log('btns', await autoBtns());
await clickAuto('効果を与える'); await w(); { const id = await ev(`getFxId(${op}.battle[0])`); await page.click(`[data-fxid="${id}"]`).catch(e=>console.log('tapfail')); await w(); await page.evaluate(()=>[...document.querySelectorAll('#fieldPickBtns button')].find(b=>/決定/.test(b.textContent))?.click()); await w(); }
console.log('grants', await ev(`JSON.stringify(${op}.battle[0].kwGrants)`));
console.log('sources', await ev(`getStackEffectSources(${op}.battle[0]).map(s=>s.field+':'+s.text.slice(0,30)).join(' | ')`));
// simulate opponent main phase start triggers
const opi = await ev('1-practiceState.viewingIndex');
console.log('trig', await ev(`JSON.stringify(collectStackTriggers(${op}.battle[0], ${opi}, 'battle', ['自分のメインフェイズ開始時']).map(e=>[e.field,e.text]))`));
await ev(`(() => { practiceState.viewingIndex = ${opi}; practiceState.turn.playerIndex = ${opi}; clearEffectQueue(); enqueueEffects([], collectStackTriggers(practiceState.players[${opi}].battle[0], ${opi}, 'battle', ['自分のメインフェイズ開始時'])); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
console.log('Q', await ev(`JSON.stringify({cur: practiceState.effectQueue.current && [practiceState.effectQueue.current.stackUid, practiceState.effectQueue.current.text.slice(0,40), practiceState.effectQueue.current.field], pend: practiceState.effectQueue.pending.map(e=>[e.stackUid,e.text.slice(0,30),e.field]), opi: ${opi}, view: practiceState.viewingIndex})`)); console.log('opp btns', await autoBtns(), await ev(`JSON.stringify([practiceState.effectQueue.current && practiceState.effectQueue.current.stackUid, practiceState.players.map(p=>p.battle.map(s=>s.uid+':'+miniCardName(s.cards[s.cards.length-1])))])`));
await clickAuto('アタック'); await w(); console.log('after', await bar(), await page.evaluate(()=>document.getElementById('fieldPickBanner').hidden?'':document.getElementById('fieldPickText').innerText));
await browser.close(); console.log(errs);
