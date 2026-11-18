// 条件の「名称に「X」以外の〜」: X自身は合わず、ほかは残りの条件で判定(ジャスティモン:アクセルアームの代償)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const cond = '名称に「ジャスティモン:アクセルアーム」以外のLv.6のデジモンカード';
const r = await ev(`['BT19-064','BT11-073','BT1-010'].map(n=>String(revealCondMatches(cardIndexByNumber.get(n), ${JSON.stringify(cond)}))).join()`);
console.log(r);
await browser.close(); console.log(r === 'true,false,false' ? errs : ['ng']);
