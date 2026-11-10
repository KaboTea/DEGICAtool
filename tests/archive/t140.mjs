import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
for (const num of ['BT13-080','BT14-032','BT12-011','BT11-030','EX11-016','P-180','BT1-085','BT2-089']) {
  await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false},{cards:['BT12-087'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); const c=cardIndexByNumber.get('${num}'); const line=c.effect.split('\\n').find(l=>/その後|置ける|破棄/.test(l) && /【/.test(l))||c.effect.split('\\n')[0]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'${num}', cardName:'${num}', field:'effect', lineIndex:0, text:line, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
  console.log(num, await ev(`'-'`), JSON.stringify(await cls()));
}

await browser.close(); console.log(errs);
