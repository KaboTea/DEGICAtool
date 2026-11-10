import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => {
  const NL = String.fromCharCode(10);
  const out = { verbMismatch: [], oddCond: [], unknownCond: [], restMissing: [] };
  const VERBS = /(手札に加え|登場(?:させ|でき)|使用でき|下に[^、。]{0,6}?置|破棄(?:する|し)|進化(?:でき|させ)|セキュリティの(?:上|下)に[^、。]*?置)/g;
  for (const c of cardIndexByNumber.values()) for (const f of ['effect','inherited','security_effect']) (c[f]||'').split(NL).forEach(line => {
    if (!/デッキの上から\\d+枚オープンする/.test(line)) return;
    const t = engineStripNotes(line);
    const sp = parseRevealInstructions(line); if (!sp) return;
    const after = t.replace(/^[\\s\\S]*?オープンする。/, '');
    const body = after.split(/残(?:り|った)|オープンしたカード(?:は|を)/)[0];
    const sents = body.split('。').filter(x => /その中|そのカードが/.test(x));
    const nVerb = sents.reduce((a, x) => a + (x.match(VERBS) || []).length, 0);
    if (nVerb > sp.steps.length) out.verbMismatch.push(c.number + ' [' + nVerb + '/' + sp.steps.length + '] ' + sents.join('。').slice(0, 120));
    sp.steps.forEach(s => {
      if (/[、。]|\\d+枚|その中|を$/.test(s.cond)) out.oddCond.push(c.number + ' [' + s.cond + ']');
      const known = s.cond.replace(/「[^」]*」/g, '').replace(/(名称に|特徴に|特徴|を含む|を持つ|の記述がある|か|\\/|と|・|デジモンカード|テイマーカード|オプションカード|カード|Lv\\.\\d+(以下|以上)?|(登場|使用)?コスト\\d+(以下|以上)?|[赤青黄緑黒紫白]|の|≪[^≫]*≫)/g, '').trim();
      if (known) out.unknownCond.push(c.number + ' [' + s.cond + '] 余り:' + known);
    });
    if (!sp.rest && /残(り|った)|オープンしたカード/.test(after)) out.restMissing.push(c.number + ' ' + after.slice(0, 100));
  });
  return out;
})()`);
for (const k of Object.keys(r)) { console.log('### ' + k + ' ' + r[k].length); console.log(r[k].slice(0, 40).join('\n')); }
await browser.close(); console.log(errs);
