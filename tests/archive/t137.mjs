import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`JSON.stringify([cardIndexByNumber.get('BT21-009').type, revealCondMatches(cardIndexByNumber.get('BT21-009'),'特徴「アプモン」を持つデジモンカード'), revealCondMatches(cardIndexByNumber.get('BT21-009'),'特徴に「アプモン」を持つデジモンカード')])`));
await browser.close();
