import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
console.log(await ev(`(() => { const all=[...cardIndexByNumber.values()].filter(c=>/使用条件《特徴「セイバーズ」》/.test(JSON.stringify(c))); const c=all[0]; const sab=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /セイバーズ/.test(c.type||'') && !(c.color||[]).some(x=>(all[0].color||[]).includes(x)));
 ${P(v)}.battle=[{cards:[sab.number],rested:false}];
 return JSON.stringify({n:all.length, nums:all.map(x=>x.number), fields:Object.keys(c).filter(k=>/使用条件/.test(String(c[k]))), eff:c.effect, strip:engineStripNotes(c.effect).slice(0,120), sab:[sab.number,sab.name,sab.type,sab.color], color:c.color, check:optionColorCheck(c, ${v}), sub: evalFieldCondition('特徴「セイバーズ」を持つ自分のデジモン/テイマーがいる', ${v})}, null, 1); })()`));
await browser.close(); console.log(errs);
