import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX8-045'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; renderPracticeBoard(); })()`);
const r = await ev(`(() => { const st=${P(v)}.battle[0]; const all=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ extractEffectConditions(line, st, ${v}).forEach(x=>{ if(x.result!=null) all.push(c.number+' ['+x.result+'] '+x.cond+'   <<'+x.raw); }); }))); const out=[]; for(let i=0;i<all.length;i+=Math.floor(all.length/45)) out.push(all[i]); return all.length+'\\n'+out.join('\\n'); })()`);
console.log(r);
await browser.close(); console.log(errs);
