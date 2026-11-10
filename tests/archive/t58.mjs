import { page, browser } from '../head.mjs';
console.log(await page.evaluate(()=>getComputedStyle(document.getElementById('lsDockToggle')).display));
await browser.close();
