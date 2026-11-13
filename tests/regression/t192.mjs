// v0.98.5: 「自分の裏向きのセキュリティを上から1枚手札に加える」(EX11-063 サイキヨ)と「相手の裏向きのセキュリティを上から1枚表向きにし、〜」(EX11-041)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const H = (num, re) => `(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const c=cardIndexByNumber.get('${num}'); const line=c.effect.split('\\n').find(l=>${re}.test(l));
  return getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'登場時', event:'登場'}); })()`;
// 1 サイキヨ: 表向き(一番上)は飛ばして、裏向きの一番上を手札へ
o.saikiyo = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; practiceState.turn.playerIndex=pi; P.battle=[{cards:['EX11-063']}]; P.hand=[];
  P.security=[{n:'BT1-030',u:1}, 'BT1-028', 'BT1-010'];
  const hs=${H('EX11-063', '/裏向きのセキュリティを上から/')}; const h=hs.find(h=>/裏向きのセキュリティを上から1枚手札へ/.test(h.label)); if(!h) return 'nohandler:'+hs.map(x=>x.label).join('/');
  h.run(); return P.hand.length===1 && P.hand[0]==='BT1-028' && P.security.length===2 && cardEntryFaceUp(P.security[0]) && cardEntryNum(P.security[1])==='BT1-010'; })()`);
// 2 EX11-041: 「表向きにし、」で文が続いても表向きにするボタンが出る
o.flip = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; P.battle=[{cards:['EX11-041']}]; O.security=['BT1-010','BT1-011'];
  const h=${H('EX11-041', '/表向きにし/')}.find(h=>/表向きにする/.test(h.label)); if(!h) return 'nohandler'; h.run(); return cardEntryFaceUp(O.security[0]) && !cardEntryFaceUp(O.security[1]); })()`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
