// v0.97.2: 【セキュリティ】効果で「このカード」を登場/バトルエリアに置く/手札/【メイン】効果を発揮
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const setup = (num) => ev(`(() => { const pi=practiceState.turn.playerIndex, di=1-pi; const D=practiceState.players[di]; D.battle=[]; const A=practiceState.players[pi]; A.battle=[{cards:['BT1-010']}]; window.__dest=null; clearEffectQueue();
  attackState = { attackerStack: A.battle[0], defenderOwner: D, secPending: { top: '${num}', resolve: (d) => { window.__dest=d; attackState.secPending=null; if (d==='place') D.battle.push({cards:['${num}'], rested:false, placedNoUse:true}); if (d==='play') D.battle.push({cards:['${num}'], rested:false, pendingEntry:{fromZone:'security',byEffect:true}}); renderPracticeBoard(); } } };
  return di; })()`);
const H = (num, di) => `(() => { const c=cardIndexByNumber.get('${num}'); const line=(c.security_effect||c.effect).split('\\n').find(l=>/【セキュリティ】/.test(l)); return getEffectHandlers({ownerIndex:${di}, lki:true, lkiUid:'sec-x', stackUid:null, cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'セキュリティ', event:'セキュリティチェック'}); })()`;
const find = (pred) => ev(`[...cardIndexByNumber.values()].find(c => { const t=(c.security_effect||'')+'\\n'+(c.effect||''); const l=t.split('\\n').find(x=>/^【セキュリティ】/.test(x.trim()))||''; return (${pred}); }).number`);
// テイマー: 登場させる
const tamer = await find(`c.category==='tamer' && /このカードをコストを支払わずに登場させる/.test(l) && !/【登場時】/.test(c.effect||'')`);
let di = await setup(tamer);
o.tamerBtn = await ev(`${H(tamer, di)}.filter(h=>/登場させる/.test(h.label)).length === 1`);
await ev(`${H(tamer, di)}.find(h=>/登場させる/.test(h.label)).run()`);
o.tamerPlay = await ev(`window.__dest === 'play'`);
// オプション: バトルエリアに置く → 【メイン】は発揮しない
const opt = await find(`c.category==='option' && /^【セキュリティ】このカードをバトルエリアに置く。?$/.test(engineStripNotes(l).trim())`);
di = await setup(opt);
await ev(`${H(opt, di)}.find(h=>/バトルエリアに置く/.test(h.label)).run()`);
await page.waitForTimeout(300);
o.optPlace = await ev(`window.__dest === 'place' && practiceState.players[${di}].battle.length === 1`);
o.noMain = await ev(`(() => { const q=getEffectQueue(); return !(q.current && /【メイン】/.test(q.current.text||'')); })()`);
// オプション: 【メイン】効果を発揮する → 効果パネルにメインが積まれる
const opt2 = await find(`c.category==='option' && /このカードの【メイン】効果を発揮/.test(l)`);
di = await setup(opt2);
await ev(`(() => { const c=cardIndexByNumber.get('${opt2}'); const line=(c.security_effect||c.effect).split('\\n').find(l=>/【セキュリティ】/.test(l)); clearEffectQueue(); enqueueEffects([], [{ownerIndex:${di}, lki:true, lkiUid:'sec-x', stackUid:null, cardNumber:'${opt2}', cardName:c.name, field:c.security_effect?'security':'effect', lineIndex:1000, text:line, timing:'セキュリティ', event:'セキュリティチェック'}]); })()`);
await ev(`finishCurrentEffect(false)`);
o.mainQueued = await ev(`(() => { const q=getEffectQueue(); return [q.current, ...q.pending].some(x => x && /【メイン】/.test(x.text||'') && x.cardNumber==='${opt2}'); })()`);
// 【メイン】の中の「その後、このカードをバトルエリアに置く」(BT10-097など)
const opt3 = await ev(`[...cardIndexByNumber.values()].find(c => c.category==='option' && /【セキュリティ】このカードの【メイン】効果を発揮/.test((c.security_effect||'')+(c.effect||'')) && /【メイン】[^\\n]*このカードをバトルエリアに置/.test(c.effect||'')).number`);
di = await setup(opt3);
o.mainPlaceBtn = await ev(`(() => { const c=cardIndexByNumber.get('${opt3}'); const line=c.effect.split('\\n').find(l=>/【メイン】/.test(l)); return getEffectHandlers({ownerIndex:${di}, lki:true, lkiUid:'sec-x', stackUid:null, cardNumber:'${opt3}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'メイン', event:'セキュリティ'}).some(h=>/バトルエリアに置く/.test(h.label)); })()`);
await ev(`attackState = null; clearEffectQueue();`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o), tamer, opt, opt2, opt3);
await browser.close(); console.log(ng.length ? ng : errs);
