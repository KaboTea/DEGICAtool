import { page, ev, errs, browser, enq, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=250) => page.waitForTimeout(ms);
const me = 'practiceState.players[practiceState.viewingIndex]';
const view = () => page.evaluate(() => { const m=document.getElementById('cardDetailModal'); if (!m.classList.contains('open')) return '(closed)';
  const instr = (document.querySelector('#detailBody .detail-info > div:nth-child(2)')||{}).innerText||'';
  const rows=[...document.querySelectorAll('#detailBody .rg-row')].map(r => r.querySelector('div[style*="font-weight:700"]').textContent + ':' + [...r.querySelectorAll('button')].map(b => (b.disabled?'x':'') + b.textContent).join(','));
  return instr.replace(/\n/g,' / ') + '\n   ' + rows.join('\n   ') + '\n   bottom: ' + [...document.querySelectorAll('#detailBody .rg-bulk, #detailBody .rg-manual, #detailBody .reveal-guided')].map(b=>b.textContent).join(' | '); });
const st = () => ev(`(() => { const p=${me}; return 'hand+' + (p.hand.length) + ' battle=' + p.battle.map(s=>s.cards.map(miniCardName).join('>')).join('|') + ' trash=' + p.trash.map(miniCardName).join(',') + ' libTop=' + p.library.slice(0,2).map(miniCardName) + ' libBottom=' + p.library.slice(-3).map(miniCardName) + ' mem=' + practiceState.memory; })()`);
const click = (re, nth=0) => page.evaluate(([r, n]) => [...document.querySelectorAll('#detailBody button')].filter(b => !b.disabled && new RegExp(r).test(b.textContent))[n].click(), [re, nth]);
await ev(`practiceState.turn.phase='main'`);
// A: テイマー1枚手札 / 赤Lv.3 1枚登場 / 残り好きな順でデッキの下
await ev(`(() => { const p=${me}; p.hand=[]; p.battle=[]; p.trash=[]; p.library.unshift('AD1-020','BT3-018','EX7-007','BT1-090','ST7-02'); renderPracticeBoard(); })()`);
await enq('【登場時】自分のデッキの上から5枚オープンする。その中のテイマーカード1枚を手札に加え、赤のLv.3のデジモンカード1枚をコストを支払わずに登場できる。残りは好きな順番でデッキの下に戻す。');
console.log('A btns', await autoBtns()); await clickAuto('オープン'); await w(); console.log('A view', await view());
await click('①手札'); await w(); await click('②登場'); await w(); console.log('A after2', await view());
console.log('A bulk', await page.evaluate(()=>[...document.querySelectorAll('#detailBody .rg-bulk')].map(b=>b.textContent).join('|'))); await click('③山札下'); await w(); await click('順番お任せ'); await w();
console.log('A final', await view(), await st());
// B: both-match & bulk trash
await ev(`(() => { const p=${me}; p.hand=[]; p.battle=[]; p.trash=[]; p.library.unshift('EX7-007','BT3-018','ST7-02'); renderPracticeBoard(); })()`);
await enq('【登場時】自分のデッキの上から3枚オープンする。その中の赤のデジモンカード1枚を手札に加え、Lv.3のデジモンカード1枚をコストを支払わずに登場できる。残りは破棄する。');
await clickAuto('オープン'); await w(); console.log('B view', await view());
await click('①手札'); await w(); console.log('B after1', await view());
await click('残り'); await w(); console.log('B final', await view(), await st());
// C: manual toggle + back
await ev(`(() => { const p=${me}; p.library.unshift('EX7-007','BT3-018'); renderPracticeBoard(); })()`);
await enq('【登場時】自分のデッキの上から2枚オープンする。その中のテイマーカード1枚を手札に加える。残りはデッキの下に戻す。');
await clickAuto('オープン'); await w(); console.log('C view', await view());
await click('手動'); await w(); console.log('C manual', await page.evaluate(() => document.querySelector('#detailBody').innerText.replace(/\s+/g,' ').slice(0,160)));
await click('効果の指示'); await w(); console.log('C back', (await view()).split('\n')[0]);
await ev('cardDetailModal.classList.remove("open"); activeRevealSession=null;');
// D: evolve from revealed (this digimon)
await ev(`(() => { const p=${me}; p.battle=[{cards:['BT1-010'],rested:false}]; p.library.unshift('AD1-001','BT1-090'); renderPracticeBoard(); })()`);
const uid = await ev(`JSON.stringify(ensureStackUid(${me}.battle[0]))`);
await ev(`(() => { clearEffectQueue(); enqueueEffects([], [{ownerIndex: practiceState.viewingIndex, stackUid: ${uid}, cardNumber:'BT1-010', cardName:'テスト', field:'inherited', lineIndex:0, text:'【アタック時】自分のデッキの上から2枚オープンする。その中の赤のLv.4のデジモンカード1枚に、このデジモンからコストを支払わずに進化できる。残りは破棄する。', timing:'アタック時', event:'t'}]); renderEffectPanel(); })()`);
console.log('D btns', await autoBtns()); await clickAuto('オープン'); await w(); console.log('D view', await view());
await click('①進化'); await w();
const fid = await ev(`getFxId(${me}.battle[0])`); await page.click(`[data-fxid="${fid}"]`); await w();
await page.click('#evolveRouteList .evolve-route-item'); await w(); console.log('D back', await view());
await click('残り'); await w(); console.log('D final', await st());
await browser.close(); console.log('errs', errs);
