import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX8-045'],rested:false}]; renderPracticeBoard(); })()`);
const r = await ev(`(() => { const st=${P(v)}.battle[0]; const out=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ const L=line.trim(); if (MATERIAL_COND_DP_PATTERN.test(L)) return; const m=/^((?:【[^】]+】)+)(?:［[^］]*］)?(.+?)間、このデジモン(?:は|の)?(?:をDP|のDPを|DP)([+\\-＋－]\\d+)(?:する)?(?:し|。|、)/.exec(engineStripNotes(L)); if(!m) return; if(!/^(【(自分|相手|お互い)のターン】)+$/.test(m[1])) return; let r; try{ r=evalStackCondition(m[2].replace(/^.*。/,''), st, ${v}); }catch(e){ r='E'; } out.push(c.number+'/'+f+' ['+r+'] '+m[2]+' => '+m[3]); }))); return out.length+'\\n'+out.join('\\n'); })()`);
console.log(r);
await browser.close(); console.log(errs);
