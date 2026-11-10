import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  const out=[]; document.querySelectorAll('#practiceBoardPanel *').forEach(e => { if (e.children.length===0 && /^(山札|トラッシュ)$/.test(e.textContent.trim())) { const p=e.closest('button,[id],.zone-tile,.ls-zone'); const r=(p||e).getBoundingClientRect(); out.push(e.textContent.trim()+' '+(p?(p.tagName+'#'+p.id+'.'+p.className):'')+' '+JSON.stringify([Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)])); } });
  return out; });
console.log(r.join('\n')); await browser.close();
