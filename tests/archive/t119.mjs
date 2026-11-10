import { page, ev, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT24-088'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
console.log(await ev(`(() => { const st=${P(v)}.battle[0]; const miss={}; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ extractEffectCosts(line).forEach(x=>{ const hs=costHandlersFor({ownerIndex:${v}, text:x.cost+'ことで、≪1ドロー≫。', cardName:'x'}, st); if(!hs.length){ const k=x.cost.replace(/「[^」]*」/g,'「」'); miss[k]=(miss[k]||[]).concat(c.number); } }); }))); return Object.entries(miss).filter(x=>/^この(デジモン|テイマー|カード)/.test(x[0])).sort((a,b)=>b[1].length-a[1].length).map(x=>x[1].length+' '+x[0]+'  ('+x[1].slice(0,3).join(',')+')').join('\\n'); })()`));
await browser.close();
