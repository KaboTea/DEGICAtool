// 2026-11-22: オプションの「相手のデジモン1体に「【自分のメインフェイズ開始時】このデジモンでアタックする。」の効果を与える」(BT27-100/BT18-099)
// 進化元効果の「この「アルファモン:王竜剣」をアクティブにできる」(BT27-015): その名前のデジモンのときだけ
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
o.grant = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; O.battle=[{cards:['BT1-010']}]; P.battle=[];
  return ['BT27-100','BT18-099'].map(n=>{ const c=cardIndexByNumber.get(n); const l=c.effect.split('\\n').find(x=>/アタックする。」/.test(x)); const pl=parseEffectLine(l);
    return effectHandlersWithConds({ownerIndex:${pi}, stackUid:null, cardNumber:n, cardName:c.name, field:'effect', lineIndex:0, text:pl.text, timing:pl.labels[0], event:'使用'}).handlers.filter(h=>/効果を与える/.test(h.label)).length; }).join(); })()`);
o.ok_grant = o.grant === '1,1';
const ou = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='アルファモン:王竜剣').number`);
o.act = await ev(`(() => { const P=practiceState.players[${pi}]; const t='この「アルファモン:王竜剣」をアクティブにできる。';
  const run=(cards)=>{ P.battle=[{cards, rested:true}]; renderPracticeBoard(); const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-015', cardName:'x', field:'inherited', lineIndex:0, text:t, timing:'お互いのターン', event:'t'}).find(h=>/アクティブ/.test(h.label)); if(!h) return 'nobtn'; h.run(); return String(P.battle[0].rested); };
  return run(['BT27-015','${ou}'])+','+run(['BT27-015','BT1-010']); })()`);
o.ok_act = o.act === 'false,nobtn';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
