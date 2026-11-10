import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`(() => { const a=[...cardIndexByNumber.values()].filter(c=>(c.inherited||'').includes('リンク') && !/〈リンク〉/.test(c.inherited)); return a.length+'\\n'+a.slice(0,12).map(c=>c.number+' '+c.name+' | '+c.inherited.slice(0,70)).join('\\n'); })()`));
await browser.close(); console.log(errs);
