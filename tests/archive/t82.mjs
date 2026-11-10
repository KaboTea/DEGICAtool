import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => { const out=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ if(/このデジモンの進化元の?枚数以下の|このデジモンと同じ表示形式|このデジモンの進化元と同じ色/.test(line)) out.push(c.number+': '+line.slice(0,140)); }))); return out.join('\\n'); })()`);
console.log(r);
await browser.close();
