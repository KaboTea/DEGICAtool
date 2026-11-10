import { page, ev, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT24-088'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
console.log(await ev(`(() => { const st=${P(v)}.battle[0]; const hit={}, miss={}; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ extractEffectCosts(line).forEach(x=>{ const hs=costHandlersFor({ownerIndex:${v}, text:x.cost+'ことで、≪1ドロー≫。', cardName:'x'}, st); const k=x.cost.replace(/「[^」]*」/g,'「」').slice(0,60); if(hs.length){ if(/体を/.test(x.cost)) hit[k+' => '+hs[0].label]=1; } else miss[k]=(miss[k]||0)+1; }); }))); return Object.keys(hit).slice(0,25).join('\\n')+'\\n=== MISS\\n'+Object.entries(miss).sort((a,b)=>b[1]-a[1]).slice(0,30).map(x=>x[1]+' '+x[0]).join('\\n'); })()`));
await browser.close();
