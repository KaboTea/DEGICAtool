import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`(() => { const c=cardIndexByNumber.get('BT21-039'); const out=[JSON.stringify(c).slice(0,1500)]; let n=0; const ex=[]; [...cardIndexByNumber.values()].forEach(c=>{ const s=JSON.stringify(c); const m=s.match(/〈ルール〉[^"\\\\]{0,60}/g); if(m){ n++; if(ex.length<15) ex.push(c.number+' '+m.join(' / ')); } }); out.push(n, ex.join('\\n')); return out.join('\\n'); })()`));
await browser.close(); console.log(errs);
