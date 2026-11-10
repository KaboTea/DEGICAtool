import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`['BT13-013','BT13-050','BT12-016'].map(n => { const c=cardIndexByNumber.get(n); return n + ': ' + parseEvolveFromZone(c.effect).map(x => JSON.stringify(x.costRule)).join(','); }).join(' | ')`));
await browser.close(); console.log(errs);
