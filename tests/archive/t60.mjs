import { page, ev, browser } from '../head.mjs';
console.log(await ev(`(() => { let n=0, cards=0, tr=0; [...cardIndexByNumber.values()].forEach(c=>{ let k=0; ['effect','inherited','security_effect'].forEach(f=>{ const r=parsePlayFromZone(c[f]||''); k+=r.length; tr+=r.filter(x=>x.zones.includes('trash')).length; }); if(c.dual) k+=parsePlayFromZone(c.dual.effect||'').length; n+=k; if(k) cards++; }); return n+' lines / '+cards+' cards / trash '+tr; })()`));
await browser.close();
