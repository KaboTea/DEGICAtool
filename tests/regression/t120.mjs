import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const banner = () => page.evaluate(() => { const b=document.getElementById('fieldPickBanner'); return b.hidden ? '(no banner)' : b.innerText.replace(/\s+/g,' '); });
const names = () => ev(`${P(v)}.battle.map(s=>s.cards.map(miniCardName).join('/')).join(' | ') + ' trash:' + ${P(v)}.trash.slice(-3).map(miniCardName).join(',')`);
const run = async (label, cards, text, extra) => {
  await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.trash=[]; p.battle=${JSON.stringify(cards)}.map(c=>({cards:c,rested:false})); renderPracticeBoard(); clearEffectQueue(); const st=p.battle[0]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(st), cardNumber:'BT1-010', cardName:'${label}', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
  console.log(label, 'before', await names(), await cls());
  await clickAuto('代償'); await page.waitForTimeout(200);
  console.log('  banner', await banner());
  if (extra) await extra();
  console.log('  after', await names(), await cls());
};
await run('A', [['BT1-019','BT1-010'],['BT1-030']], '【メイン】このデジモンを他の自分のデジモン1体の進化元の下に置くことで、≪1ドロー≫。');
await run('B', [['BT1-010'],['BT1-030'],['BT1-019']], '【メイン】このデジモンを名称に「ゴマ」を含む自分のデジモン1体の進化元の下に置くことで、≪1ドロー≫。');
await run('C', [['BT1-019','BT12-087'],['BT1-030'],['BT1-010']], '【メイン】このテイマーを他の自分のデジモン1体の進化元の下に置くことで、≪1ドロー≫。', async () => {
  await page.evaluate(()=>document.querySelectorAll('.stack-tile.target-pick')[1].click()); await page.waitForTimeout(200);
});
await browser.close(); console.log(errs);
