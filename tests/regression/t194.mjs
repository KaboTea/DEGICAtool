// テイマーを進化させる効果(BT22-090「岸部リエ」)は進化条件で絞らない / 他の条件と「/」で並んだ名称だけの進化条件(BT26-060)を判定する
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
o.tamer = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; practiceState.turn.playerIndex=pi; P.battle=[{cards:['BT22-090']}]; P.hand=['BT22-067']; P.trash=[];
  const c=cardIndexByNumber.get('BT22-090'); const line=c.effect.split('\\n').find(l=>/ロードナイトモン/.test(l) && /進化/.test(l));
  const hs=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT22-090', cardName:c.name, field:'effect', lineIndex:0, text:parseEffectLine(line).text, timing:'自分のターン終了時', event:'t'}).filter(h=>/から進化/.test(h.label));
  if (hs.length!==1) return 'btn'+hs.length; hs[0].run(); return document.querySelectorAll('#detailBody .eep-go').length===1; })()`);
await ev(`cardDetailModal.classList.remove('open')`);
o.bareAlt = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT26-085']}, {cards:['BT1-010']}];
  const c=cardIndexByNumber.get('BT26-060'); return canEvolveOntoStack(c, P.battle[0]) === true && canEvolveOntoStack(c, P.battle[1]) === false; })()`);
const ng = Object.entries(o).filter(([, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
