import { page, ev, browser } from '../head.mjs';
console.log(await ev(`(() => { const miss=[]; let tot=0; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>{ (c[f]||'').split('\\n').forEach(line=>{ parseEvolveFromZone(line).forEach(x=>{ if (x.jogress) return; tot++; if (/支払う(?:進化)?コスト[-－]\\d+/.test(line) && (!x.costRule || x.costRule.type!=='minus')) miss.push(c.number+' '+JSON.stringify(x.costRule)+' '+line.slice(0,90)); }); }); })); return tot+' miss '+miss.length+'\\n'+miss.slice(0,15).join('\\n'); })()`));
for (const n of ['P-244']) console.log(n, await ev(`JSON.stringify(parseEvolveFromZone(cardIndexByNumber.get('${n}').effect).map(x=>x.costRule))`));
console.log(await ev(`JSON.stringify([...cardIndexByNumber.values()].filter(c=>c.name==='キャロモン').map(c=>c.number+':'+JSON.stringify(parseEvolveFromZone((c.inherited||'')+'\\n'+c.effect).map(x=>x.costRule))))`));
await browser.close();
