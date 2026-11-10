import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`(() => { const k={}; [...cardIndexByNumber.values()].forEach(c=>{ ['effect','inherited','security_effect'].forEach(f=>{ ((c[f]||'').match(/〈ルール〉[^\\n]*/g)||[]).forEach(l=>{ const key=l.replace(/「[^」]*」/g,'「」'); (k[key]=k[key]||[]).push(c.number+':'+f); }); }); }); return Object.entries(k).map(([a,b])=>b.length+' '+a+' '+b.slice(0,3)).join('\\n'); })()`));
await browser.close();
