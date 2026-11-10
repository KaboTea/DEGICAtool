import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>b.textContent));
const names = () => ev(`${P(v)}.battle.map(s=>s.cards.map(miniCardName).join('/')).join(' | ') + ' raising:' + (${P(v)}.raising? ${P(v)}.raising.cards.map(miniCardName).join('/'):'-') + ' trash:' + ${P(v)}.trash.map(miniCardName).join(',') + ' mem:'+practiceState.memory`);
const setup = async (text, battle, raising) => ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; practiceState.memory=0; const p=${P(v)}; p.trash=[]; p.battle=${JSON.stringify(battle)}.map(c=>({cards:c,rested:false})); p.raising=${raising?`{cards:${JSON.stringify(raising)},rested:false}`:'null'}; renderPracticeBoard(); clearEffectQueue(); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'BT1-010', cardName:'T', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
// 1: 他の自分のデジモン1体をこのデジモンの進化元の下に置く -> 一番上だけ、下は破棄
await setup('【メイン】他の自分のデジモン1体をこのデジモンの進化元の下に置くことで、≪1ドロー≫。', [['BT1-010'],['BT1-019','BT1-030']], ['BT1-001']);
console.log('1', await names(), await cls());
await clickAuto('代償'); await page.waitForTimeout(150);
console.log(' cands', await page.evaluate(()=>document.querySelectorAll('.stack-tile.target-pick').length));
await page.evaluate(()=>document.querySelector('.stack-tile.target-pick').click()); await page.waitForTimeout(150);
await page.evaluate(()=>{ const b=[...document.querySelectorAll('#fieldPickBanner button')].find(x=>/決定/.test(x.textContent)); b&&b.click(); }); await page.waitForTimeout(150);
console.log(' after', await names());
// 2: overflow card in security discarded -> memory unchanged
const ov = await ev(`[...cardIndexByNumber.values()].find(c=>parseOverflowValue(c)!==null).number`);
await setup('【メイン】自分のセキュリティを上から1枚破棄することで、≪1ドロー≫。', [['BT1-010']]);
await ev(`${P(v)}.security.unshift('${ov}')`);
await clickAuto('代償'); await page.waitForTimeout(150);
console.log('2 overflow card', ov, await names());
await browser.close(); console.log(errs);
