import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
console.log(await ev(`(() => { const p=${P(v)}; practiceState.turn.playerIndex=${v}; p.battle=[{cards:['BT21-049','BT25-059','BT26-032'],rested:false},{cards:['BT15-009','BT1-010'],rested:false, kwGrants:[{type:'fx', text:'≪継承《「メラモン」》≫'}]}]; renderPracticeBoard();
 return JSON.stringify([p.battle.map(st=>gainedSourceEffects(st).map(g=>g.kind+':'+g.card.name+':'+g.text.slice(0,30))), [...document.querySelectorAll('#practiceBoardPanel .stack-tile')].map(t=>[...t.querySelectorAll('.status-badges-row span')].map(x=>x.textContent).join(''))]); })()`));
await browser.close(); console.log(errs);
