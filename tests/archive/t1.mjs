import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
// --- DB coverage ---
const cov = await ev(`(() => {
  const tp = practiceState.turn.playerIndex, me = practiceState.players[tp];
  let total=0, hit=0; const miss=[];
  for (const c of cardIndexByNumber.values()) {
    for (const f of ['effect','inherited']) {
      const lines = (c[f]||'').split(String.fromCharCode(10)).filter(l => { const b=engineStripNotes(l); return /離れるとき/.test(b) && /離れない/.test(b) && !l.startsWith('≪'); });
      if (!lines.length) continue;
      total++;
      const holder = f==='effect' ? { cards:[c.number], rested:false } : { cards:[c.number,'BT1-010'], rested:false };
      const other = { cards:['BT1-010'], rested:false };
      me.battle = [holder, other]; me.raising = null; if (c.effect && (c[f]||'').includes('［育成］')) { me.battle=[other]; me.raising=holder; }
      const a = collectLeavePreventers(holder,'leave').length + collectLeavePreventers(other,'leave').length;
      if (a) hit++; else miss.push(c.number+':'+lines[0].slice(0,70));
    }
  }
  me.battle = [];
  return {total, hit, miss};
})()`);
console.log('coverage', cov.total, cov.hit); console.log(cov.miss.join('\n'));
await browser.close(); console.log('errs', errs);
