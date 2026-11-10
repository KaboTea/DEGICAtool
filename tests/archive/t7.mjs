import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => {
  const nums = ['BT26-010','BT26-028','BT26-037','BT17-036','BT16-080','BT15-072','BT24-011','EX12-008'];
  practiceState.players.forEach(p => { p.battle = nums.map(n => ({cards:['BT1-010','BT2-019',n], rested:false, links:['BT26-019']})); });
  const t = [];
  for (let i=0;i<30;i++) { const a=performance.now(); renderPracticeBoard(); t.push(performance.now()-a); }
  t.sort((x,y)=>x-y); return 'median ' + t[15].toFixed(1) + 'ms / max ' + t[29].toFixed(1) + 'ms';
})()`);
console.log(r, errs); await browser.close();
