// ホーム画面・タブ用アイコン: head のリンクが揃っていて、画像とマニフェストが読み込める
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(500);
const o = await ev(`(async () => {
  const q = s => document.querySelector(s)?.getAttribute('href');
  const r = { apple: q('link[rel="apple-touch-icon"]'), svg: q('link[rel="icon"][type="image/svg+xml"]'), png: q('link[rel="icon"][type="image/png"]'), man: q('link[rel="manifest"]'), theme: document.querySelector('meta[name="theme-color"]')?.content };
  const ok = async u => (await fetch(u)).ok;
  r.files = await Promise.all([r.apple, r.svg, r.png, r.man].map(ok));
  const m = await (await fetch(r.man)).json();
  r.manIcons = await Promise.all(m.icons.map(i => ok(i.src)));
  const img = new Image(); img.src = r.apple; await img.decode(); r.appleSize = img.naturalWidth + 'x' + img.naturalHeight;
  return r; })()`);
o.ok = o.files.every(Boolean) && o.manIcons.length === 2 && o.manIcons.every(Boolean) && o.appleSize === '180x180' && !!o.theme;
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ok']);
