// 「このデジモンが発揮した≪デジバースト≫でこのカードが破棄されたとき」は≪デジバースト≫で破棄したときだけ出る
// 古い弾の書き方「相手のデジモン1体のDPを-1000する」(63枚)のボタン
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const pend = () => ev(`(() => { const q=getEffectQueue(); return [q.current, ...q.pending].filter(Boolean).filter(e=>e.event==='破棄').map(e=>e.cardNumber).sort().join(); })()`);

// 1 ≪デジバースト≫でアグモン(BT4-008)とザッソーモン(BT5-050)を破棄 → その2枚だけ出る
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT4-008','BT5-050','BT7-003','BT7-040']}]; O.battle=[{cards:['BT1-015']}]; renderPracticeBoard(); })()`); await settle();
await ev(`(() => { const P=practiceState.players[${pi}]; const tr=collectStackTriggers(P.battle[0], ${pi}, 'battle', ['メイン'], {event:'起動'})[0]; enqueueEffects([], [tr]); renderEffectPanel(); })()`);
await page.waitForTimeout(150);
await ev(`effectHandlersWithConds(getEffectQueue().current).handlers.find(h=>/代償/.test(h.label)).run()`);
await page.waitForTimeout(150);
await page.evaluate(() => [...document.querySelectorAll('#detailBody .cmp-row')].filter(r => /アグモン|ザッソーモン/.test(r.textContent)).forEach(r => r.click()));
await page.waitForTimeout(80);
await page.evaluate(() => [...document.querySelectorAll('#detailBody button')].find(x => /破棄する/.test(x.textContent) && !x.disabled).click());
await page.waitForTimeout(400);
o.burst = await pend();
o.burstOk = o.burst === 'BT4-008,BT5-050';
o.burstBtns = await ev(`(() => { const q=getEffectQueue(); return [q.current, ...q.pending].filter(e=>e && e.event==='破棄').map(e=>getEffectHandlers(e).map(h=>h.label).join('/')).join(' | '); })()`);
o.oneHandBtn = (o.burstBtns.match(/手札/g) || []).length === 1;
// 2 ≪デジバースト≫以外で進化元から破棄 → 出ない
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT7-003','BT5-004','BT1-016']}]; renderPracticeBoard(); })()`); await settle();
await ev(`(() => { const P=practiceState.players[${pi}]; snapshotPracticeState(); removeCardFromStackAt(P.battle[0], 0, 'trash', undefined, () => renderPracticeBoard()); renderPracticeBoard(); })()`);
await page.waitForTimeout(300);
o.noBurst = await pend();
o.noBurstOk = o.noBurst === '' && await ev(`practiceState.players[${pi}].trash.includes('BT7-003')`);
// 3 BT1-104「相手のデジモン1体のDPを-2000する」→ ボタンで相手のDPが下がる
await ev(`(() => { const O=practiceState.players[1-${pi}]; O.battle=[{cards:['BT1-015']}]; renderPracticeBoard(); })()`); await settle();
o.dp = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; const c=cardIndexByNumber.get('BT1-104'); const line=c.effect.split('\\n').find(l=>/DPを-/.test(l)); const pl=parseEffectLine(line);
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:null, cardNumber:'BT1-104', cardName:c.name, field:'effect', lineIndex:0, text:pl.text, timing:'メイン', event:'使用'}).find(h=>/DP-2000/.test(h.label));
  if (!h) return 'nobtn'; const before=getEffectiveDP(O.battle[0]); h.run(); if (fieldPickMode) { fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); } return before - getEffectiveDP(O.battle[0]); })()`);
o.dpOk = o.dp === 2000;
const ng = Object.entries(o).filter(([k, x]) => k.endsWith('Ok') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
