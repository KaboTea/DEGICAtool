// v0.97.13: 裏向きセキュリティを表向きに(BT20-050) / 表向きセキュリティの【登場時】を発揮(BT23-060) / このデジモンをセキュリティの上に(LM-007) / 「〜がいるとき、」の対象効果(P-023)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const H = (num, re, holder) => `(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const c=cardIndexByNumber.get('${num}'); const line=c.effect.split('\\n').find(l=>${re}.test(l));
  return getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(${holder || 'P.battle[0]'}), cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'x', event:'t'}); })()`;
// 1 BT20-050
o.flip = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; practiceState.turn.playerIndex=pi; P.battle=[{cards:['BT20-050']}]; O.security=[{n:'BT1-010',u:1},'BT1-011','BT1-012'];
  const h=${H('BT20-050', '/表向きにする/')}.find(h=>/表向きにする/.test(h.label)); if(!h) return 'nohandler'; h.run(); return cardEntryFaceUp(O.security[1]) && !cardEntryFaceUp(O.security[2]); })()`);
// 2 BT23-060
const zx = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /ザクソン/.test(c.type||'') && /【登場時】/.test(c.effect||'')).number`);
o.zaxon = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT23-060']}]; P.security=['${zx}', {n:'${zx}',u:1}];
  const h=${H('BT23-060', '/ザクソン/')}.find(h=>/表向きのセキュリティ/.test(h.label)); if(!h) return 'nohandler'; h.run(); return document.querySelectorAll('#detailBody .eep-go').length===1; })()`);
await page.evaluate(() => document.querySelector('#detailBody .eep-go').click());
await page.waitForTimeout(300);
o.zaxonQueued = await ev(`(() => { const q=getEffectQueue(); const P=practiceState.players[practiceState.viewingIndex]; return q.pending.some(x=>x.cardNumber==='${zx}' && x.stackUid===ensureStackUid(P.battle[0])); })()`);
await ev(`(() => { const q=getEffectQueue(); q.pending=[]; q.current=null; renderEffectPanel(); })()`);
// 3 LM-007
o.lm007 = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT1-010','LM-007']}]; P.security=['BT1-011']; P.trash=[];
  const h=${H('LM-007', '/アタック終了時/')}.find(h=>/このデジモンをセキュリティ/.test(h.label)); if(!h) return 'nohandler'; h.run(); return 'ok'; })()`);
await page.waitForTimeout(300);
o.lm007moved = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; return JSON.stringify({b:P.battle.map(s=>s.cards), s:P.security, t:P.trash}); })()`);
// 4 P-023
o.p023 = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const tk=[...cardIndexByNumber.values()].find(c=>c.name==='高石タケル').number; const pt=[...cardIndexByNumber.values()].find(c=>c.name==='パタモン').number;
  P.battle=[{cards:['P-023']},{cards:[pt]}]; const hs=${H('P-023', '/高石タケル/')}; const h=hs.find(h=>/がいるとき/.test(h.label)); if(!h) return 'nohandler:'+hs.map(x=>x.label).join('/'); h.run();
  const blocked = !fieldPickMode; P.battle.push({cards:[tk]}); P.battle[1].cards.unshift('BT1-010'); P.security=['BT1-011']; P.trash=[]; h.run();
  if (!fieldPickMode) return 'nopick'; fieldPickMode.selected=[P.battle[1]]; finishFieldPick(); return blocked; })()`);
await page.waitForTimeout(400);
o.p023moved = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const last=P.security[P.security.length-1]; return P.battle.length===2 && P.security.length===2 && !cardEntryFaceUp(last) && (cardIndexByNumber.get(cardEntryNum(last))||{}).name==='パタモン' && P.trash.includes('BT1-010'); })()`);
o.lm007ok = o.lm007moved === JSON.stringify({b:[], s:['LM-007','BT1-011'], t:['BT1-010']});
const ng = Object.entries(o).filter(([k, x]) => x !== true && x !== 'ok' && k !== 'lm007moved').map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
