import { page, ev, errs, browser } from '../head.mjs';
import fs from 'fs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX8-045'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; renderPracticeBoard(); })()`);
const r = await ev(`(() => { const st=${P(v)}.battle[0]; let t=0,known=0,dep=0; const unk={}; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ extractEffectConditions(line, st, ${v}).forEach(x=>{ t++; if(x.result!=null) known++; else if (x.dependent) dep++; else unk[x.cond]=(unk[x.cond]||0)+1; }); }))); const arr=Object.entries(unk).sort((a,b)=>b[1]-a[1]); return t+' known '+known+' dependent '+dep+' uniqueUnknown '+arr.length+' unknownTotal '+arr.reduce((a,b)=>a+b[1],0)+'\\n'+arr.map(x=>x[1]+'\\t'+x[0]).join('\\n'); })()`);
fs.writeFileSync('cond_survey2.txt', r);
console.log(r.split('\n').slice(0,60).join('\n'));
await browser.close(); console.log(errs);
