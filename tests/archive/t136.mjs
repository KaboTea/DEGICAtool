import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false,links:[]}]; p.hand.push('BT21-009'); renderPracticeBoard(); clearEffectQueue(); const c=cardIndexByNumber.get('BT25-060'); const line=c.effect.split('\\n').find(l=>/ことで/.test(l)); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'BT25-060', cardName:'x', field:'effect', lineIndex:0, text:line, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
const dp0 = await ev(`getEffectiveDP(${P(v)}.battle[0])`);
await clickAuto('代償'); await page.waitForTimeout(200);
console.log(await page.evaluate(()=>{ const el=[...document.querySelectorAll('#cardDetailModal *')].find(x=>x.offsetParent && /^ガッチモン/.test(x.textContent.trim()) && x.textContent.length<40); el && el.click(); return !!el; }));
await page.evaluate(()=>{ const x=[...document.querySelectorAll('button')].find(y=>y.offsetParent && y.textContent.trim()==='リンクさせる'); x && x.click(); }); await page.waitForTimeout(200);
console.log(dp0, await ev(`JSON.stringify([${P(v)}.battle[0].links, getEffectiveDP(${P(v)}.battle[0])])`));
await browser.close(); console.log(errs);
