// v0.96.10: レストの代償はボタンを押すまでレストしない/フィールド効果の一覧に常在効果(付与・DP・禁止)を出す
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const pi = await ev('practiceState.turn.playerIndex');
const o = {};
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-010']},{cards:['BT4-095']}]; renderPracticeBoard();
 const c=cardIndexByNumber.get('BT4-095'); const l=c.effect.split('\\n').find(x=>/レストさせることで/.test(x));
 const e={ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[1]), cardNumber:'BT4-095', cardName:c.name, field:'effect', lineIndex:0, text:l, timing:'自分のターン', event:'t', manual:true};
 window.__e=e; const q=getEffectQueue(); q.current=e; renderEffectPanel(); })()`);
await page.waitForTimeout(300);
o.notRestedYet = await ev(`practiceState.players[${pi}].battle[1].rested !== true && getEffectQueue().current === window.__e`);
o.labels = await ev(`getEffectHandlers(window.__e).map(h=>(h.isCost?'[代償]':'')+h.label)`);
await ev(`getEffectHandlers(window.__e).find(h=>h.isCost && /レスト/.test(h.label)).run()`);
await page.waitForTimeout(300);
o.restedAfterCost = await ev(`practiceState.players[${pi}].battle[1].rested === true && getEffectQueue().current === window.__e && isEffectEntryValid(window.__e) && window.__e.costPaid === true`);
// 既にレストしているテイマーの効果は始められない
await ev(`(() => { const q=getEffectQueue(); q.current=null; const P=practiceState.players[${pi}]; const e2=Object.assign({}, window.__e, {_restChecked:false, costPaid:false}); P.battle[1].rested=true; q.current=e2; renderEffectPanel(); })()`);
await page.waitForTimeout(200);
o.restedCannotStart = await ev(`getEffectQueue().current === null`);
// フィールド効果の一覧に常在効果が出る
await ev(`(() => { const q=getEffectQueue(); q.current=null; const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; const dai=[...cardIndexByNumber.values()].find(c=>c.category==='tamer'&&c.name==='大門大').number;
 P.battle=[{cards:['BT1-010','BT25-104']},{cards:[dai]},{cards:['EX13-038','BT1-025']}]; O.battle=[{cards:['BT8-071']}]; renderPracticeBoard(); })()`);
const rows = await ev('collectStaticFieldDisplay().map(r=>r.label+":"+r.text)');
o.feGrant = rows.some(x => /^付与:.*大門大/.test(x));
o.feDP = rows.some(x => /^DP:.*レスト状態の自分のデジモン全てをDP\+1000/.test(x));
o.feRx = rows.some(x => /^禁止:.*支払う登場コストをマイナスできない/.test(x));
delete o.labels;
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
