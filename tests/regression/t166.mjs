// v0.96.8: 「自分の「大門大」1体はデジモン・DP3000としても扱い」→ 効果のボタンで「デジモンにする」(カード詳細と同じ処理)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const pi = await ev('practiceState.turn.playerIndex');
const o = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT13-008']},{cards:['BT12-092']},{cards:['BT13-099']}]; renderPracticeBoard(); const o={};
 const H = (num, l) => getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[0]), cardNumber:num, cardName:'x', field:'effect', lineIndex:0, text:l, timing:'メイン', event:'t'}).find(h=>/🦖/.test(h.label));
 H('BT13-008','【メイン】［ターンに1回］このターンの間、自分の「大門大」1体はデジモン・DP3000としても扱い、進化できない。').run();
 const st=P.battle[1]; o.oneDai = st.actingAsDigimon === true && getEffectiveDP(st) === 3000 && isDigimonLikeStack(st) && !P.battle[2].actingAsDigimon;
 P.battle[1].actingAsDigimon=false; P.battle.push({cards:['BT17-087']});
 H('BT25-104','【自分のターン】自分の「大門大」全てはデジモン・DP12000としても扱い、≪速攻≫を得る。').run();
 o.allDai = P.battle[1].actingAsDigimon && P.battle[3].actingAsDigimon && P.battle[1].assignedDP === 12000 && !P.battle[2].actingAsDigimon;
 o.label = /🦖 このテイマーをデジモンにする\\(DP3000\\)/.test(getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[2]), cardNumber:'BT13-099', cardName:'x', field:'effect', lineIndex:0, text:'【自分のターン終了時】次の相手のターン終了まで、このテイマーはデジモン・DP3000としても扱い、進化できず、≪ブロッカー≫を得る。', timing:'自分のターン終了時', event:'t'}).map(h=>h.label).join('/'));
 return o; })()`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
