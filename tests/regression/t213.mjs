// 「「ベムモン」の記述がある」はセキュリティ効果の文も見る(BT21-098 ラグナロク・キャノン)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const r = await ev(`['BT21-098','BT1-010'].map(n=>String(revealCondMatches(cardIndexByNumber.get(n), '「ベムモン」の記述があるカード'))).join()`);
console.log(r);
await browser.close(); console.log(r === 'true,false' ? errs : ['ng']);
