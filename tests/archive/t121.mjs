import { page, ev, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT24-088'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
console.log(await ev(`(() => { const st=${P(v)}.battle[0]; const miss=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ extractEffectCosts(line).forEach(x=>{ const hs=costHandlersFor({ownerIndex:${v}, text:x.cost+'ことで、≪1ドロー≫。', cardName:'x'}, st); if(!hs.length) miss.push(c.number+'\\t'+x.cost); }); }))); return miss.length+'\\n'+miss.join('\\n'); })()`));
await browser.close();
