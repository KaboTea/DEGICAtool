import { page, ev, errs, browser, enq, clickAuto } from '../head.mjs';
await ev(`(() => { const p=practiceState.players[practiceState.viewingIndex]; p.library.unshift('AD1-020','BT3-018','EX7-007','BT1-090','ST7-02'); practiceState.turn.phase='main'; renderPracticeBoard(); })()`);
await enq('【登場時】自分のデッキの上から5枚オープンする。その中のテイマーカード1枚を手札に加え、赤のLv.3のデジモンカード1枚をコストを支払わずに登場できる。残りは好きな順番でデッキの下に戻す。');
await clickAuto('オープン'); await page.waitForTimeout(400);
await (await page.$('#cardDetailModal .modal')).screenshot({path:`rv_${process.env.W||1280}.png`});
await browser.close(); console.log(errs);
