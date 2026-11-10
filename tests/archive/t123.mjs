import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`JSON.stringify(practiceState.players.map(p=>[p.library.length+p.hand.length+p.security.length, p.hand.map(miniCardName).join(',')]))`));
await browser.close(); console.log(errs);
