import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const banner = () => page.evaluate(() => { const b=document.getElementById('fieldPickBanner'); return b.hidden ? '(no banner)' : b.innerText.replace(/\s+/g,' '); });
const names = () => ev(`${P(v)}.battle.map(s=>s.cards.map(miniCardName).join('/')).join(' | ')`);
const run = async (label, cards, text, extra) => {
  await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=${JSON.stringify(cards)}.map(c=>({cards:c,rested:false})); renderPracticeBoard(); clearEffectQueue(); const st=p.battle[0]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(st), cardNumber:'BT1-010', cardName:'${label}', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
  console.log(label, 'before', await names(), await cls());
  await clickAuto('代償'); await page.waitForTimeout(200);
  console.log('  banner', await banner());
  if (extra) await extra();
  console.log('  after', await names(), await cls(), 'sec0', await ev(`JSON.stringify(${P(v)}.security[0])`), 'secN', await ev(`JSON.stringify(${P(v)}.security.slice(-1)[0])`));
};
await run('A', [['BT1-010','BT1-019','BT1-030']], '【メイン】このデジモンに重ねられているカードを上から1枚このデジモンの進化元の下に置くことで、≪1ドロー≫。');
await run('B', [['BT1-010','BT1-019']], '【メイン】このデジモンに重ねられているカードを上から1枚自分のセキュリティの上に裏向きで置くことで、≪1ドロー≫。');
await run('C', [['BT1-010','BT1-019']], '【メイン】このデジモンに重ねられているカードを上から1枚セキュリティの下に表向きで置くことで、≪1ドロー≫。');
await run('D', [['BT1-010','BT1-019'],['BT1-030','BT1-031']], '【メイン】自分のデジモン1体に重ねられているカードを上から1枚手札に戻すことで、≪1ドロー≫。', async () => {
  await page.evaluate(()=>document.querySelectorAll('.stack-tile.target-pick')[1].click());
  await page.waitForTimeout(150); console.log('  banner2', await banner());
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('#fieldPickBanner button')].find(x=>/決定|OK/.test(x.textContent)); b&&b.click(); }); await page.waitForTimeout(150);
});
await run('E', [['BT1-019']], '【メイン】このデジモンに重ねられているカードを上から1枚破棄することで、≪1ドロー≫。');
await browser.close(); console.log(errs);
