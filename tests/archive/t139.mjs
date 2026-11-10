import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT1-019'],rested:true}, {cards:['BT12-087'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
const r = await ev(`(() => { const st=${P(v)}.battle[0]; let n=0, cards=0; const kinds={}; const ex=[]; const t0=performance.now();
 [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ if(!line) return;
   const e={ownerIndex:${v}, stackUid:ensureStackUid(st), cardNumber:c.number, cardName:c.name, field:f, text:line};
   const hs=effectMovementHandlersFor(e, st); if(hs.length){ cards++; n+=hs.length; hs.forEach(h=>{ const k=h.label.replace(/「[^」]*」/g,'「」').replace(/\\d+/g,'N'); kinds[k]=(kinds[k]||0)+1; }); if(ex.length<12 && Math.random()<0.05) ex.push(c.number+' | '+line.slice(0,90)+' => '+hs.map(h=>h.label).join(' / ')); }
 })));
 return JSON.stringify({n, cards, ms: Math.round(performance.now()-t0), top:Object.entries(kinds).sort((a,b)=>b[1]-a[1]).slice(0,25), ex}); })()`);
const o=JSON.parse(r); console.log(o.n, o.cards, o.ms+'ms'); o.top.forEach(x=>console.log(x[1], x[0])); o.ex.forEach(x=>console.log(x));
await browser.close(); console.log(errs);
