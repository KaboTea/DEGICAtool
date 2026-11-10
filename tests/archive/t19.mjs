import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`['ST24-04','ST23-06','EX13-026','EX9-007','BT10-087','BT11-061'].map(n => { const c=cardIndexByNumber.get(n); const line=c.effect.split(String.fromCharCode(10)).find(l=>/オープン/.test(l)); const sp=parseRevealInstructions(line); return n+': '+sp.steps.map(s=>'['+s.cond+']x'+s.count+'→'+s.act).join(' ; ')+' rest='+sp.rest; })`);
console.log(r.join('\n'));
await browser.close(); console.log(errs);
