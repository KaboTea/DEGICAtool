// v0.97.14: 「その中の特徴に「ハイブリッド体」/「十闘士」を持つカードと進化元効果を持つテイマーカード1枚ずつを手札に加える」(BT17-020): 2つの条件に分ける
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
o.steps = await ev(`(() => { const sp=parseRevealInstructions(cardIndexByNumber.get('BT17-020').effect.split('\\n').find(l=>/オープン/.test(l))); return sp.steps.filter(s=>s.act==='hand').map(s=>s.cond).join(' | '); })()`);
o.two = o.steps.split(' | ').length === 2;
o.tamerOk = await ev(`(() => { const sp=parseRevealInstructions(cardIndexByNumber.get('BT17-020').effect.split('\\n').find(l=>/オープン/.test(l))); const st=sp.steps.filter(s=>s.act==='hand');
  return revealCondMatches(cardIndexByNumber.get('AD1-023'), st[1].cond) !== false && revealCondMatches(cardIndexByNumber.get('BT17-020'), st[0].cond) !== false && revealCondMatches(cardIndexByNumber.get('BT17-020'), st[1].cond) === false; })()`);
o.bt4 = await ev(`(() => { const sp=parseRevealInstructions(cardIndexByNumber.get('BT4-023').effect.split('\\n').find(l=>/オープン/.test(l))); return sp.steps.filter(s=>s.act==='hand').length===2; })()`);
const ng = Object.entries(o).filter(([k, x]) => k !== 'steps' && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
