import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false,links:['BT21-009']}]; renderPracticeBoard(); clearEffectQueue(); const line=cardIndexByNumber.get('BT25-073').effect.split('\\n').find(l=>/ことで/.test(l)); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'BT25-073', cardName:'x', field:'effect', lineIndex:0, text:line, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
await clickAuto('代償'); await page.waitForTimeout(300);
console.log(await page.evaluate(()=>[document.getElementById('cardDetailModal').classList.contains('open'), document.querySelector('#cardDetailModal')?.innerText.slice(0,300)]));
console.log(await page.evaluate(()=>[...document.querySelectorAll('.toast, #toast, .toast-msg')].map(x=>x.innerText)));
await browser.close(); console.log(errs);
