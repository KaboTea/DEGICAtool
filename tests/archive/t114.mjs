import { page, ev, errs, browser } from '../head.mjs';
console.log(await ev(`(() => { const r=[]; [...cardIndexByNumber.values()].filter(c=>/^(カリスモン|ナビモン|ガッチモン|ドガッチモン)$/.test(c.name)).forEach(c=>r.push(c.number+' '+JSON.stringify({e:c.effect,i:c.inherited,s:c.security_effect}))); let n=0, both=0; [...cardIndexByNumber.values()].forEach(c=>{ if(/〈リンク〉|＜リンク＞|<リンク>/.test(c.inherited||'')){ n++; } if(/〈リンク〉/.test(c.effect||'')) both++; }); r.push('link in inherited: '+n+' in effect: '+both); return r.join('\\n'); })()`));
await browser.close(); console.log(errs);
