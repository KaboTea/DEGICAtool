import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => {
  let total=0, withSteps=0, restOnly=0, none=0; const acts={}, rests={}; const miss=[]; const samples=[];
  for (const c of cardIndexByNumber.values()) for (const f of ['effect','inherited','security_effect']) (c[f]||'').split(String.fromCharCode(10)).forEach(line => {
    if (!/デッキの上から\\d+枚オープン(する|できる)/.test(line)) return; total++;
    const sp = parseRevealInstructions(line);
    if (!sp) { none++; miss.push(c.number+': '+engineStripNotes(line).replace(/^.*?オープンする。/,'').slice(0,90)); return; }
    if (sp.steps.length) withSteps++; else { restOnly++; miss.push('(restonly) '+c.number+': '+engineStripNotes(line).replace(/^.*?オープンする。/,'').slice(0,90)); }
    sp.steps.forEach(s => acts[s.act]=(acts[s.act]||0)+1); rests[sp.rest]=(rests[sp.rest]||0)+1;
    if (samples.length < 12 && Math.random() < 0.04) samples.push(c.number+' '+sp.steps.map(s=>'['+s.cond+']x'+s.count+'→'+s.act).join(' ; ')+' rest='+sp.rest);
  });
  return {total, withSteps, restOnly, none, acts, rests, miss: miss.slice(0,30), samples};
})()`);
console.log(r.total, 'steps', r.withSteps, 'restOnly', r.restOnly, 'none', r.none, JSON.stringify(r.acts), JSON.stringify(r.rests));
console.log(r.samples.join('\n')); console.log('--miss'); console.log(r.miss.join('\n'));
await browser.close(); console.log(errs);
