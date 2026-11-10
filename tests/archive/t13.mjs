import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => {
  let total=0, hit=0; const miss=[], byRule={}; const samples=[];
  for (const c of cardIndexByNumber.values()) for (const f of ['effect','inherited','security_effect']) {
    (c[f]||'').split(String.fromCharCode(10)).forEach(line => {
      const p = parseEffectLine(line); const t = engineStripNotes(p.text);
      if (!/(手札|トラッシュ)[^。]{0,40}に[^。]{0,30}進化(できる|させる)/.test(t)) return;
      if (!p.labels.length || p.labels.every(l => /ターン$/.test(l))) { if (!/^・/.test(p.text) && !/その後/.test(p.text)) return; }
      total++;
      const evs = parseEvolveFromZone(p.text);
      if (evs.length) { hit++; evs.forEach(x => { const k = x.jogress ? 'jogress' : x.costRule.type + (x.ignoreCond?'+ignore':''); byRule[k]=(byRule[k]||0)+1; if (samples.length<14 && Math.random()<0.06) samples.push(c.number+' '+x.who+' '+x.zones+' ['+x.cond+'] '+k); }); }
      else miss.push(c.number+': '+t.slice(0,100));
    });
  }
  return {total, hit, byRule, miss: miss.slice(0,25), samples};
})()`);
console.log(r.total, r.hit, JSON.stringify(r.byRule)); console.log(r.samples.join('\n')); console.log('--miss'); console.log(r.miss.join('\n'));
await browser.close(); console.log(errs);
