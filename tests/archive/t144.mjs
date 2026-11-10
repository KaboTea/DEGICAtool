import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
console.log(await ev(`(() => { const out=[]; ['BT25-104','P-235','ST24-07','ST24-15','BT26-050'].forEach(n=>{ const c=cardIndexByNumber.get(n);
  const sab=[...cardIndexByNumber.values()].find(x=>x.category==='digimon' && /セイバーズ/.test(x.type||'') && !(x.color||[]).some(y=>(c.color||[]).includes(y)));
  ${P(v)}.battle=[{cards:[sab.number],rested:false}];
  const where = c.dual ? 'dual' : 'effect'; const txt=(c.dual?c.dual.effect:c.effect)||'';
  out.push(n+' '+c.name+' '+c.category+' '+JSON.stringify(c.color)+' ['+where+'] kw:'+/使用条件/.test(txt)+' sec:'+/使用条件/.test(c.security_effect||'')+' inh:'+/使用条件/.test(c.inherited||'')+' => '+optionColorCheck(c, ${v}).html); }); return out.join('\\n'); })()`));
await browser.close(); console.log(errs);
