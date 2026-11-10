import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const setup = async (text, extra) => ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; practiceState.memory=0; const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-030'],rested:false}]; p.trash=[]; ${extra||''}; renderPracticeBoard(); clearEffectQueue(); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'BT1-010', cardName:'T', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
// 1 & 4: draw then discard
await setup('【登場時】≪1ドロー≫。その後、自分の手札を1枚破棄する。');
console.log('A0', JSON.stringify(await cls()));
await clickAuto('ドロー'); await page.waitForTimeout(200);
console.log('A1', JSON.stringify(await cls()));
await clickAuto('手札を1枚破棄'); await page.waitForTimeout(200);
await page.evaluate(()=>{ const it=document.querySelector('#cardDetailModal .dli-name'); it && it.click(); const x=[...document.querySelectorAll('#cardDetailModal button')].find(y=>y.offsetParent && /破棄/.test(y.textContent) && !/やめる/.test(y.textContent)); x && x.click(); }); await page.waitForTimeout(250);
console.log('A2', JSON.stringify(await cls()), await ev(`${P(v)}.trash.length`));
// 2: fallback cost — cancel keeps unpaid
await setup(await ev(`cardIndexByNumber.get('P-021').effect.split('\\n').find(l=>/ことで/.test(l))`), `p.hand.push([...cardIndexByNumber.values()].find(c=>c.name==='パルモン').number)`);
console.log('B0', JSON.stringify(await cls()));
await clickAuto('代償'); await page.waitForTimeout(400);
console.log('B1 modal', await page.evaluate(()=>[...document.querySelectorAll('.modal.open, #cardDetailModal.open, .modal-overlay.open')].map(x=>x.id+':'+x.innerText.slice(0,60).replace(/\s+/g,' '))));
console.log('B1 paid?', await ev(`JSON.stringify([getEffectQueue().current.costPaid, getEffectQueue().current.costPending])`));
// cancel -> still unpaid
await page.evaluate(()=>document.getElementById('cardDetailModal').classList.remove('open')); await ev('renderEffectPanel()');
console.log('B2 after cancel', JSON.stringify(await cls()), await ev(`!!getEffectQueue().current.costPaid`));
await clickAuto('代償'); await page.waitForTimeout(400);
await page.evaluate(()=>{ const x=[...document.querySelectorAll('#cardDetailModal button')].find(y=>y.offsetParent && /登場/.test(y.textContent)); x && x.click(); }); await page.waitForTimeout(600);
console.log('B3 vis', await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent && b.getBoundingClientRect().width>0).map(b=>b.textContent.trim().slice(0,24)).filter(t=>/登場|コスト|やめる|決定/.test(t))), await ev(`JSON.stringify([${P(v)}.hand.length, ${P(v)}.battle.length, ${P(v)}.raising])`));
console.log('B3 open?', await page.evaluate(()=>[...document.querySelectorAll('.modal.open, #cardDetailModal.open')].map(x=>x.id+':'+x.innerText.slice(0,80).replace(/\s+/g,' '))));
await page.evaluate(()=>{ const x=[...document.querySelectorAll('button')].find(y=>y.offsetParent && /効果で登場/.test(y.textContent)); x && x.click(); }); await page.waitForTimeout(600);
console.log('B4', JSON.stringify(await cls()), await ev(`JSON.stringify([getEffectQueue().current && getEffectQueue().current.costPaid, ${P(v)}.battle.length, getEffectQueue().current && getEffectQueue().current.cardName])`));
await browser.close(); console.log(errs);
