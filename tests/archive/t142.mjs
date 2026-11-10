import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>b.textContent));
const run = async (text, holderTamer) => {
  await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false},{cards:['BT12-087'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[${holderTamer?1:0}]), cardNumber:'BT12-087', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
  const b = await cls(); await clickAuto(b.find(x=>/🔀|💸/.test(x)) ? (b.find(x=>/🔀/.test(x)) ? '🔀' : '💸') : '###'); await page.waitForTimeout(200);
  await page.evaluate(()=>{ const it=document.querySelector('#cardDetailModal .dli-name'); it && it.click(); const x=[...document.querySelectorAll('#cardDetailModal button')].find(y=>y.offsetParent && /置く|決定/.test(y.textContent)); x && x.click(); }); await page.waitForTimeout(150);
  const tile=await page.evaluate(()=>document.querySelectorAll('.stack-tile.target-pick').length); if (tile) { await page.evaluate(()=>{ const t=[...document.querySelectorAll('.stack-tile.target-pick')].pop(); t.click(); }); await page.waitForTimeout(150); await page.evaluate(()=>{ const b=[...document.querySelectorAll('#fieldPickBanner button')].find(x=>/決定/.test(x.textContent)); b&&b.click(); }); await page.waitForTimeout(150); }
  console.log(text.slice(4,50), JSON.stringify(b), '=>', await ev(`JSON.stringify(${P(v)}.battle[1].cards)`));
};
await run('【メイン】自分のデッキの上から1枚をこのテイマーの下に裏向きで置く。', true);
await run('【メイン】自分の手札から、デジモンカード1枚を自分のテイマー1体の下に裏向きで置ける。', false);
await run('【メイン】自分のトラッシュから、カード1枚を自分のテイマーの下に置く。', false);
await browser.close(); console.log(errs);
