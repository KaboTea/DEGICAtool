import { page, ev, browser } from '../head.mjs';
console.log(await ev(`(() => { const out=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(l=>parsePlayFromZone(l).forEach(p=>{ if(/の、/.test(p.cond)) out.push(c.number+': '+p.zones+' '+p.cond); })))); return out.join('\\n'); })()`));
await browser.close();
