// 縦画面(スマホ)の選ぶ画面: カードが多いとき、一覧がスクロールでき、決定ボタンが画面の中に見える
import { page, ev, errs, browser } from '../head.mjs';
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1500);
const r = await ev(`(() => {
  openCardMultiPicker({ title: 'テスト', sub: '(4枚)', entries: Array.from({length: 40}, () => ({ num: 'BT1-010', ok: true })), max: 4, min: 0, actions: [{ label: '置く', primary: true, onClick: () => {} }] });
  const l=document.querySelector('#detailBody .cmp-list'), b=document.querySelector('#detailBody .cmp-act').getBoundingClientRect();
  const scrolls = l.scrollHeight > l.clientHeight + 10 && getComputedStyle(l).overflowY === 'auto';
  return scrolls + ',' + (b.bottom <= innerHeight && b.top >= 0); })()`);
console.log(r);
await browser.close(); console.log(r === 'true,true' ? errs : ['ng']);
