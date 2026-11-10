import { page, ev, browser } from '../head.mjs';
const me='practiceState.players[practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; ${me}.battle=[{cards:['BT13-043','EX13-032'],rested:false}]; ${me}.security=['BT1-010']; renderPracticeBoard(); resolveDestructionQueue([${me}.battle[0]], ()=>{}, {battleContext:true}); })()`);
await page.waitForTimeout(400);
console.log(await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/離れない/.test(x.textContent)); const out=[]; let e=b; for(let i=0;i<4&&e;i++){ const cs=getComputedStyle(e); out.push((e.id||e.className)+' ws='+cs.whiteSpace+' w='+e.offsetWidth+' disp='+cs.display+' flexwrap='+cs.flexWrap); e=e.parentElement;} return out.join('\n'); }));
await browser.close();
