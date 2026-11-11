// v0.97.7: 「〜ごとに、以下の効果から1つを発揮」の選べる数・代償の対象選びにも「〜ごとに上限+」
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const r = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi];
  const tam=[...cardIndexByNumber.values()].filter(c=>c.category==='tamer' && (c.color||[]).length===1);
  const t1=tam.find(c=>c.color[0]==='red'), t2=tam.find(c=>c.color[0]==='blue'), t3=tam.find(c=>c.color[0]==='yellow');
  P.battle=[{cards:['EX13-077']},{cards:[t1.number]},{cards:[t2.number]},{cards:[t3.number]}]; renderPracticeBoard();
  const c=cardIndexByNumber.get('EX13-077'); const ls=c.effect.split('\\n'); const li=ls.findIndex(l=>/以下の効果から/.test(l));
  const hs=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'EX13-077', cardName:c.name, field:'effect', lineIndex:li, text:withSubLines(ls[li], c.effect, li), timing:'x', event:'t'}).map(h=>h.label);
  const cols=new Set(); P.battle.forEach(st=>(getStackTopCard(st).color||[]).forEach(x=>cols.add(x)));
  return JSON.stringify({hs, n: Math.floor(cols.size/2)}); })()`);
const j = JSON.parse(r);
o.choose = j.hs[0].includes(`今は${j.n}つ`);
o.battle = j.hs.some(h => /🥊/.test(h));
// BT14-081: 代償の対象選び(相手のデジモン消滅)にもLv.上限+が入る
o.costRaise = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT14-081']},{cards:['BT1-010']}]; renderPracticeBoard();
  const c=cardIndexByNumber.get('BT14-081'); const line=c.effect.split('\\n').find(l=>/選べるLv/.test(l));
  return getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT14-081', cardName:c.name, field:'effect', lineIndex:1, text:line, timing:'x', event:'t'}).map(h=>h.label).join(' ;; '); })()`); o.costRaise = /代償[^;]*ごとにLv/.test(o.costRaise);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
