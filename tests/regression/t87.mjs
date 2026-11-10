import { page, ev, errs, browser, autoBtns } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
const notes = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-cond')].map(b=>b.textContent));
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
const enqOn = (idx, text) => ev(`(() => { clearEffectQueue(); const st=${P(v)}.battle[${idx}]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(st), cardNumber:'BT1-010', cardName:'テスト', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'登場時', event:'t'}]); renderEffectPanel(); })()`);
// 1 play by effect vs manual
await ev(`(() => { ${P(v)}.battle.push({cards:['BT1-010'],rested:false,pendingEntry:{fromZone:'trash',byEffect:true}}); ${P(v)}.battle.push({cards:['BT1-010'],rested:false}); renderPracticeBoard(); clearEffectQueue(); })()`);
console.log('info', await ev(`JSON.stringify(${P(v)}.battle.map(s=>s.entryInfo))`));
await enqOn(0, '【登場時】効果で登場していたなら、≪1ドロー≫。'); console.log('byEffect play:', await notes(), await autoBtns());
await enqOn(1, '【登場時】効果で登場していたなら、≪1ドロー≫。'); console.log('manual play:', await notes(), await autoBtns());
// 2 evolve from trash
await ev(`(() => { const st=${P(v)}.battle[1]; st.cards.push('BT1-019'); st.pendingEntry={fromZone:'trash',method:'normal'}; renderPracticeBoard(); clearEffectQueue(); })()`);
console.log('evo info', await ev(`JSON.stringify(${P(v)}.battle[1].entryInfo)`));
await enqOn(1, '【進化時】トラッシュから進化していたなら、≪1ドロー≫。'); console.log('trash evo:', await notes());
// 3 jogress
await ev(`(() => { const ns={cards:['BT1-010','BT1-019','BT11-057'],rested:false,pendingEntry:{method:'jogress',count:2}}; effectEvolveHint.add(ns); ${P(v)}.battle.push(ns); renderPracticeBoard(); clearEffectQueue(); })()`);
console.log('jog info', await ev(`JSON.stringify(${P(v)}.battle[2].entryInfo)`));
await enqOn(2, '【進化時】ジョグレス進化していたなら、≪1ドロー≫。'); console.log('jogress:', await notes());
await enqOn(1, '【進化時】ジョグレス進化していたなら、≪1ドロー≫。'); console.log('not jogress:', await notes());
// 4 AND / OR
await enqOn(2, 'このデジモンの進化元に「アグモン」があり、相手のデジモンがいるなら、≪1ドロー≫。'); console.log('AND:', await notes());
await enqOn(2, '青の自分のテイマーがいるかこのデジモンの進化元に「アグモン」があるなら、≪1ドロー≫。'); console.log('OR:', await notes());
console.log('names', await ev(`${P(v)}.battle[2].cards.map(miniCardName).join(',')`));
// 5 battle destroy
await ev(`(() => { clearEffectQueue(); ${P(o)}.battle=[{cards:['BT13-079','BT1-010'],rested:false}]; renderPracticeBoard(); resolveDestructionQueue([${P(o)}.battle[0]], ()=>{}, {battleContext:true}); })()`);
await page.waitForTimeout(200);
await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/そのまま消滅/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(300);
console.log('destroy entries', await ev(`JSON.stringify([getEffectQueue().current, ...getEffectQueue().pending].filter(Boolean).map(e=>[e.cardName,e.destroyCause, e.text.slice(0,30)]))`));
console.log('destroy cond', await ev(`JSON.stringify([getEffectQueue().current, ...getEffectQueue().pending].filter(e=>e && e.destroyCause).map(e=>effectHandlersWithConds(e).conds.map(c=>c.cond+':'+c.result)))`));
await browser.close(); console.log(errs);
