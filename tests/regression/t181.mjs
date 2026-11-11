// v0.97.8: (育成エリアに登場したデジモンの【登場時】は発揮しない: 3-4-7-4) 育成エリアに登場・【消滅時】このデジモンをセキュリティの下に表向きで置く・ターン終了時の処理中に予約した保留処理
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
// 1 BT15-027: 手札から育成エリアに登場(コストなし)
const dm = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /ダークマスターズ/.test(JSON.stringify(c.traits||c.type||c)) && c.level>=5 && /【登場時】/.test(c.effect||'')).number`);
await ev(`clearEffectQueue()`);
await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT15-027']}]; P.raising=null; P.hand=['${dm}']; practiceState.memory=0; renderPracticeBoard();
  const c=cardIndexByNumber.get('BT15-027'); const line=c.effect.split('\\n').find(l=>/育成エリア/.test(l));
  getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT15-027', cardName:c.name, field:'effect', lineIndex:1, text:line, timing:'x', event:'t'}).find(h=>/育成エリアに登場/.test(h.label)).run(); })()`);
await page.waitForTimeout(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('#detailBody button')].find(x=>/登場/.test(x.textContent) && !x.disabled); b && b.click(); });
await page.waitForTimeout(300);
await page.waitForTimeout(300);
o.noPlayTrigger = await ev(`(() => { const q=getEffectQueue(); return ![q.current, ...q.pending].some(x => x && x.cardNumber === '${dm}'); })()`);
o.raising = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; return !!P.raising && cardEntryNum(P.raising.cards[0])==='${dm}' && !P.hand.length && practiceState.memory===0; })()`);
// 2 EX10-012: 【消滅時】このデジモンをセキュリティの下に表向きで置く
await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.trash=['EX10-012']; P.security=['BT1-010']; const c=cardIndexByNumber.get('EX10-012'); const line=c.effect.split('\\n').find(l=>/【消滅時】/.test(l));
  getEffectHandlers({ownerIndex:pi, lki:true, lkiUid:'x', stackUid:'gone', cardNumber:'EX10-012', cardName:c.name, field:'effect', lineIndex:3, text:line, timing:'消滅時', event:'消滅'}).find(h=>/セキュリティの下/.test(h.label)).run(); })()`);
o.secBottomUp = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const last=P.security[P.security.length-1]; return P.security.length===2 && cardEntryNum(last)==='EX10-012' && cardEntryFaceUp(last) && !P.trash.length; })()`);
// 3 ターン終了時の処理中に「自分のターン終了時、この効果で登場したデジモンを消滅させる」を予約 → 次の自分のターン終了時
o.deferred = await ev(`(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT1-010']}]; P.raising=null; practiceState.players[1-pi].battle=[]; practiceState.players[1-pi].raising=null; const uid=ensureStackUid(P.battle[0]);
  practiceState.turn.phase='end'; practiceState.deferred=[]; const now=practiceState.turn.count;
  createDeferredFromEffect({ ownerIndex: pi, cardNumber:'P-216', cardName:'ワルもんざえモン', stackUid:null, text:'【消滅時】自分のセキュリティから、特徴に「ダークマスターズ」を持つ表向きのデジモンカード1枚をコストを支払わずに登場できる。自分のターン終了時、この効果で登場したデジモンを消滅させる。', _startTops: {} });
  const d=practiceState.deferred[0]; practiceState.turn.phase='main'; return !!d && d.dueTurn === now + 2; })()`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
