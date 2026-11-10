import { page, ev, errs, browser } from '../head.mjs';
import fs from 'fs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX8-045'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; renderPracticeBoard(); })()`);
const r = await ev(`(() => { const st=${P(v)}.battle[0]; let t=0,known=0; const unk={}; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ const body=engineStripNotes(line).replace(/^(【[^】]+】|［[^］]*］|\\[[^\\]]*\\]|\\{[^}]*\\})+/,''); body.split('。').forEach(s=>{ const m=/^(?:その後、)?(.+?)(?:場合|なら)、/.exec(s); if(!m) return; const cond=m[1]; if(/この効果で|そうした|そのデジモン|その(カード|テイマー)|選んだ|公開した|破棄した|戻した|置いた/.test(cond)) return; t++; let res; try{res=evalStackCondition(cond.replace(/(の)?(場合|とき)$/,''), st, ${v});}catch(e){res='ERR '+e.message;} if(res===true||res===false) known++; else { unk[cond]=(unk[cond]||0)+1; } }); }))); const arr=Object.entries(unk).sort((a,b)=>b[1]-a[1]); return t+' known '+known+' uniqueUnknown '+arr.length+'\\n'+arr.map(x=>x[1]+'\\t'+x[0]).join('\\n'); })()`);
fs.writeFileSync('cond_survey.txt', r);
console.log(r.split('\n').slice(0,70).join('\n'));
await browser.close(); console.log(errs);
