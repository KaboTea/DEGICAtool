import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`(() => { const out=[]; [...cardIndexByNumber.values()].filter(c=>/^(フローラモン|ロゼモン|グリフォモン)$/.test(c.name)).forEach(c=>{ out.push(c.number+' '+c.name+' | '+JSON.stringify(c.traits||c.feature||c.type||Object.keys(c))+' | '+(c.effect||'').slice(0,160)); }); return out.join('\\n'); })()`));
await browser.close(); console.log(errs);
