import { page, ev, errs, browser } from '../head.mjs';
console.log(await page.evaluate(() => { const p=document.getElementById('practiceBoardPanel'); const cs=getComputedStyle(p); const r=p.getBoundingClientRect(); return cs.position + ' ' + JSON.stringify([r.left,r.top,r.width,r.height]) + ' main=' + JSON.stringify(document.querySelector('main').getBoundingClientRect()); }));
await browser.close();
