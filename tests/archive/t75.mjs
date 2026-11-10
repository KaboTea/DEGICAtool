import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = `practiceState.players[${v}]`;
console.log('parsed', await ev(`[...cardIndexByNumber.values()].reduce((a,c)=>a+['effect','inherited'].reduce((b,f)=>b+parseConditionalKeywordLines(c[f]||'').length,0),0)`));
const leo = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='レオモン')?.number`);
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P}.battle=[{cards:['${leo}','P-139'],rested:false},{cards:['BT1-010','P-139'],rested:false}]; renderPracticeBoard(); })()`);
console.log('with leomon: blocker', await ev(`hasBlockerKeyword(${P}.battle[0])`), 'indomitable', await ev(`hasIndomitableKeyword(${P}.battle[0])`));
console.log('without: blocker', await ev(`hasBlockerKeyword(${P}.battle[1])`), 'indomitable', await ev(`hasIndomitableKeyword(${P}.battle[1])`));
// evaluate all conditions for unknown (null) ratio
console.log(await ev(`(() => { let t=0,n=0; const ex=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited'].forEach(f=>parseConditionalKeywordLines(c[f]||'').forEach(cl=>{ t++; const r=evalStackCondition(cl.cond, ${P}.battle[0], ${v}); if (r==null){ n++; if(ex.length<12) ex.push(c.number+':'+cl.cond); } }))); return t+' unknown '+n+'\\n'+ex.join('\\n'); })()`));
const t0 = Date.now(); await ev('for (let i=0;i<20;i++) renderPracticeBoard()'); console.log('20 renders ms', Date.now()-t0);
await browser.close(); console.log(errs);
