// v0.98.4: 場の「〜全てに≪〜≫を与える」の読み解きを描き直しの間だけ使い回しても、結果が使い回さない場合と同じになること(全ての与える側のカード×自分/相手のターン)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const r = await ev(`(() => {
  const all=[...cardIndexByNumber.values()];
  const givers=all.filter(c=>[c.effect,c.inherited].some(t=>t && parseFieldStaticGrants(t).length)).map(c=>c.number);
  const recv=all.filter(c=>c.category==='digimon').filter((c,i)=>i%97===0).map(c=>c.number).slice(0,30);
  const tam=all.filter(c=>c.category==='tamer').slice(0,3).map(c=>c.number);
  const pi=practiceState.viewingIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi];
  let checked=0, diffs=[], granted=0;
  for (const g of givers) {
    for (const tp of [pi, 1-pi]) {
      practiceState.turn.playerIndex=tp;
      // 与える側: そのカード単体と、進化元に入れた形の両方
      P.battle=[{cards:[g]},{cards:['BT1-010', g]}, ...recv.slice(0,8).map((n,i)=>({cards:[n], rested:i%2===1})), ...tam.map(n=>({cards:[n]}))];
      O.battle=recv.slice(8,14).map((n,i)=>({cards:[n], rested:i%2===0}));
      const targets=[...P.battle, ...O.battle];
      fieldGrantCache=null;
      const a=targets.map(st=>JSON.stringify(fieldStaticGrantsOn(st).map(x=>[x.dp,x.kws,x.srcName,x.text])));
      fieldGrantCache={stateRef:practiceState, list:null};
      const b=targets.map(st=>JSON.stringify(fieldStaticGrantsOn(st).map(x=>[x.dp,x.kws,x.srcName,x.text])));
      fieldGrantCache=null;
      targets.forEach((st,i)=>{ checked++; if(a[i]!=='[]') granted++; if(a[i]!==b[i]) diffs.push(g+' tp'+tp+' #'+i); });
    }
  }
  return {givers:givers.length, checked, diffs:diffs.slice(0,10), ndiff:diffs.length, granted};
})()`);
console.log(JSON.stringify(r));
const ng = [];
if (r.ndiff) ng.push('diff');
if (r.granted < 50) ng.push('granted');
await browser.close(); console.log(ng.length ? ng : errs);
