import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const banner = () => page.evaluate(() => { const b=document.getElementById('fieldPickBanner'); return b.hidden ? '(no banner)' : b.innerText.replace(/\s+/g,' '); });
const st = () => ev(`JSON.stringify({me:${P(v)}.battle.map(s=>s.cards.map(miniCardName).join('/')+(s.rested?'(R)':'')), op:${P(1-v)}.battle.map(s=>s.cards.map(miniCardName).join('/')+(s.rested?'(R)':'')), sec:[${P(v)}.security.length, JSON.stringify(${P(v)}.security.slice(0,2))], osec:${P(1-v)}.security.length, trash:${P(v)}.trash.length, otrash:${P(1-v)}.trash.length})`);
const setup = async (label, me, op, text, rest0) => {
  await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}, o=${P(1-v)}; p.trash=[]; o.trash=[]; p.battle=${JSON.stringify(me)}.map(c=>({cards:c,rested:${!!rest0}})); o.battle=${JSON.stringify(op)}.map(c=>({cards:c,rested:false})); renderPracticeBoard(); clearEffectQueue(); const st=p.battle[0]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(st), cardNumber:'BT1-010', cardName:'${label}', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
  console.log(label, await st(), await cls());
};
const tap = async (i) => { await page.evaluate((i)=>document.querySelectorAll('.stack-tile.target-pick')[i].click(), i); await page.waitForTimeout(150); };
const confirm = async () => { await page.evaluate(()=>{ const b=[...document.querySelectorAll('#fieldPickBanner button')].find(x=>/決定|OK|完了/.test(x.textContent)); b&&b.click(); }); await page.waitForTimeout(150); };
// A: デジモン1体をレストさせる (any side)
await setup('A', [['BT1-010'],['BT1-030']], [['BT1-019']], '【メイン】デジモン1体をレストさせることで、≪1ドロー≫。');
await clickAuto('代償'); await page.waitForTimeout(150); console.log(' banner', await banner(), await page.evaluate(()=>document.querySelectorAll('.stack-tile.target-pick').length));
await tap(2); await confirm(); console.log(' after', await st(), await cls());
// B: このデジモンをアクティブにする (rested)
await setup('B', [['BT1-010']], [], '【メイン】このデジモンをアクティブにすることで、≪1ドロー≫。', true);
await clickAuto('代償'); await page.waitForTimeout(150); console.log(' after', await st(), await cls());
// C: Lv.6の自分のデジモン1体をセキュリティの上に置く
await setup('C', [['BT1-010','BT1-019','BT1-085'],['BT1-030']], [], '【メイン】Lv.6の自分のデジモン1体をセキュリティの上に置くことで、≪1ドロー≫。');
console.log(' lv', await ev(`cardIndexByNumber.get('BT1-085').level`));
await clickAuto('代償'); await page.waitForTimeout(150); console.log(' banner', await banner()); await tap(0); await confirm(); console.log(' after', await st(), await cls());
// D: 最もセキュリティ枚数が多い
await setup('D', [['BT1-010']], [], '【メイン】最もセキュリティ枚数が多いプレイヤー1人のセキュリティを上から1枚破棄することで、≪1ドロー≫。');
await ev(`${P(1-v)}.security.push('BT1-010')`);
await clickAuto('代償'); await page.waitForTimeout(150); console.log(' bar', await page.evaluate(()=>document.getElementById('attackBarMsg').innerText));
await page.evaluate(()=>{ const b=[...document.querySelectorAll('#attackBarActs button')].find(x=>/相手のセキュリティ/.test(x.textContent)); b&&b.click(); }); await page.waitForTimeout(150);
console.log(' after', await st(), await cls());
// E: 表向き→裏向き
await setup('E', [['BT1-010']], [], '【メイン】自分の表向きのセキュリティを上から1枚裏向きにすることで、≪1ドロー≫。');
await ev(`${P(v)}.security[1]={n:${P(v)}.security[1], u:true}`);
await clickAuto('代償'); await page.waitForTimeout(150); console.log(' after', await st(), await cls(), await page.evaluate(()=>[...document.querySelectorAll('.toast,#toast')].map(x=>x.innerText).join('|')));
// F: 手札からセキュリティの下に表向き
await setup('F', [['BT1-010']], [], '【メイン】自分の手札から、デジモンカード1枚をセキュリティの下に表向きで置くことで、≪1ドロー≫。');
await ev(`${P(v)}.hand.push('BT1-030')`);
await clickAuto('代償'); await page.waitForTimeout(150);
await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(x=>x.offsetParent && x.children.length===0 && x.textContent.trim()==='ゴマモン'); el && el.click(); });
await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && x.textContent.trim()==='置く'); b && b.click(); }); await page.waitForTimeout(150);
console.log(' after', await st(), await ev(`JSON.stringify(${P(v)}.security.slice(-1))`), await cls());
await browser.close(); console.log(errs);
