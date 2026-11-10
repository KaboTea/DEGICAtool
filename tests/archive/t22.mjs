import { page, ev, errs, browser } from '../head.mjs';
const nums = ['BT11-072','BT18-023','BT21-087','BT24-058','BT25-078','EX5-071','P-167','BT9-104','EX2-072','BT12-086','BT16-029','BT10-032','BT8-009','P-118'];
const r = await ev(`${JSON.stringify(nums)}.map(n => { const c=cardIndexByNumber.get(n); return [c.effect,c.security_effect,c.inherited].filter(Boolean).join(String.fromCharCode(10)).split(String.fromCharCode(10)).filter(l=>/オープン/.test(l)).map(line => { const sp=parseRevealInstructions(line); return n+': '+(sp?sp.steps.map(s=>'['+s.cond+']x'+s.count+'→'+s.act+(s.alt?'|'+s.alt:'')).join(' ; ')+' rest='+sp.rest:'(null)'); }).join(String.fromCharCode(10)); })`);
console.log(r.join('\n'));
// matcher spot checks
const m = await ev(`(() => { const C=(n)=>cardIndexByNumber.get(n); const t=[];
  const multi=[...cardIndexByNumber.values()].find(c=>c.category==='digimon'&&(c.color||[]).length===2&&c.color.includes('red'));
  t.push('赤を含む2色: mono=' + revealCondMatches(C('BT1-010'),'赤を含む2色のカード') + ' multi(' + multi.name + ')=' + revealCondMatches(multi,'赤を含む2色のカード'));
  t.push('白以外: agumon=' + revealCondMatches(C('BT1-010'),'白以外のデジモンカード'));
  t.push('黄のテイマー: AD1-020=' + revealCondMatches(C('AD1-020'),'黄のテイマー') + ' agumon=' + revealCondMatches(C('BT1-010'),'黄のテイマー'));
  t.push('進化元効果を持つテイマー: AD1-020=' + revealCondMatches(C('AD1-020'),'進化元効果を持つ赤のテイマーカード'));
  t.push('Aを含むかB: ' + revealCondMatches(C('BT1-010'),'名称に「アグモン」を含むか特徴に「フリー」を持つデジモンカード') + '/' + revealCondMatches(C('BT1-090'),'名称に「アグモン」を含むか特徴に「フリー」を持つデジモンカード'));
  return t.join(String.fromCharCode(10)); })()`);
console.log(m);
await browser.close(); console.log(errs);
