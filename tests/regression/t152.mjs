// v0.92.1: 自動エンド(メモリーが相手側へ→効果を片付けたらエンドへ / 見えていない開きっぱなしの小窓では止まらない)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const ph = () => ev('practiceState.turn.phase');
const out = {};
await ev(`(() => { snapshotPracticeState(); practiceState.memory = practiceState.turn.playerIndex===0 ? 2 : -2; enqueueEffects([], [{ownerIndex:practiceState.turn.playerIndex, stackUid:null, lki:true, lkiUid:'x', cardNumber:'BT13-095', cardName:'大門大', field:'effect', lineIndex:0, text:'【お互いのターン】このテイマーがレストしたとき、メモリー+1。', timing:'お互いのターン', event:'t'}]); renderEffectPanel(); renderPracticeBoard(); })()`);
await page.waitForTimeout(1200); out.wait = (await ph()) === 'main';
await ev(`finishCurrentEffect(true)`); await page.waitForTimeout(1500); out.end = (await ph()) === 'end';
// 見えていない小窓(class open だけ残っている)では止まらない
await ev(`(() => { autoEndDisarm(); zonePopupEl.classList.add('open'); zonePopupEl.style.display='none'; })()`);
out.hiddenPopup = (await ev(`autoEndBusyReason()`)) === '';
const ng = Object.entries(out).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(out));
await browser.close(); console.log(ng.length ? ng : errs);
