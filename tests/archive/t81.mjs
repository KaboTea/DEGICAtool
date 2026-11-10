import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => { const cnt={}; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ try{ parseTargetActions(line).forEach(ta=>{ if(/このデジモン(より|の|と同じ)|DPが|Lv\\.が|枚数が|コストが/.test(ta.prefix||'')) { const k=(ta.prefix||'').replace(/「[^」]+」/g,'「」'); cnt[k]=(cnt[k]||0)+1; } }); }catch(e){} }))); return Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(x=>x[1]+'\\t'+x[0]).join('\\n'); })()`);
console.log(r);
await browser.close(); console.log(errs);
