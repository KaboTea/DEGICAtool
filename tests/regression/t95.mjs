import { page, ev, errs, browser, autoBtns, enq, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; practiceState.memory=0; ${P(v)}.battle=[{cards:['BT24-088'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; ${P(v)}.hand=['BT24-010','BT1-010','BT24-031']; renderPracticeBoard(); clearEffectQueue(); })()`);
// hand discard
await enq('【メイン】自分の手札から、特徴に「TS」を持つカード1枚を破棄することで、≪2ドロー≫。');
console.log('hand:', await cls());
await clickAuto('代償');
await page.waitForTimeout(200);
console.log(await page.evaluate(()=>{ const m=[...document.querySelectorAll('.modal, [id*=Picker], [class*=picker]')].filter(x=>x.offsetParent); return m.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,250)).join(' || '); }));
await page.evaluate(()=>{ const rows=[...document.querySelectorAll('[data-i], .cmp-row, .mp-row')]; console.log(rows.length); });
const ok = await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(x=>x.offsetParent && x.children.length===0 && /グレイモン/.test(x.textContent)); if(!el) return 'no'; el.click(); return 'clicked'; });
console.log(ok);
await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && /^破棄する/.test(x.textContent.trim())); b && b.click(); });
await page.waitForTimeout(200);
console.log('after:', await cls(), await ev(`${P(v)}.hand.map(miniCardName).join(',')`), await ev(`${P(v)}.trash.slice(-1).map(miniCardName)`));
// security
await enq('【メイン】自分のセキュリティを上から1枚破棄することで、相手のデジモン1体を消滅させる。');
console.log('sec:', await cls());
const s0 = await ev(`${P(v)}.security.length`);
await clickAuto('代償'); console.log('sec after:', await cls(), s0, '->', await ev(`${P(v)}.security.length`));
// memory
await enq('【メイン】1コスト支払うことで、≪1ドロー≫。');
console.log('mem:', await cls());
await clickAuto('代償'); console.log('mem after:', await cls(), await ev('practiceState.memory'));
// tamer
await enq('相手のデジモン1体を消滅させる。その後、このテイマーをレストさせることで、≪1ドロー≫。');
console.log('mixed (no holder):', await cls());
await browser.close(); console.log(errs);
