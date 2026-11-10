import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => { const out={}; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ engineStripNotes(line).split('。').forEach(s=>{ const m=/(ジョグレス進化していた|デジクロスしていた|効果で登場[^、。]*していた|効果で進化していた|同じLv\\.に進化していた|バトル以外で消滅していた|リンク状態|アセンブリ[^、。]*していた|バースト進化[^、。]*していた|進化していた|登場していた)(?:場合|なら|とき|、)/.exec(s); if(!m) return; const k=m[1]; (out[k]=out[k]||[]).push(c.number+'/'+f+': '+s.slice(0,110)); }); }))); return Object.entries(out).map(([k,v])=>'### '+k+' ('+v.length+')\\n'+v.slice(0,4).join('\\n')).join('\\n'); })()`);
console.log(r);
await browser.close();
