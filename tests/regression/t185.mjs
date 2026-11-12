// v0.97.12: セキュリティまわりの抜けを埋めた分
//  ≪リカバリー≫単独ボタン / 相手は相手のセキュリティを手札に / テイマーのセキュリティデジモンDP(ST3-12) / 期間つきのセキュリティデジモンDP(P-053)
//  ［セキュリティ］の進化コスト軽減(P-181) / ［セキュリティ］【相手のターン終了時】(BT20-052) / EX10-061 の表向きセキュリティを下に置く軽減 / BT19-053 の置き換え
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const H = (num, re, extra) => `(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const c=cardIndexByNumber.get('${num}'); const line=c.effect.split('\\n').find(l=>${re}.test(l));
  return getEffectHandlers(Object.assign({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'x', event:'t'}, ${extra || '{}'})); })()`;
// 1 ≪リカバリー+1《デッキ》≫ 単独(P-186)
o.rec = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; practiceState.turn.playerIndex=pi; P.battle=[{cards:['P-186']}]; P.library=['BT1-001','BT1-002']; P.security=['BT1-010'];
  const h=${H('P-186', '/リカバリー/')}.find(h=>/リカバリー/.test(h.label)); if(!h) return 'nohandler'; h.run(); return P.security.length===2 && cardEntryNum(P.security[0])==='BT1-001' && P.library.length===1; })()`);
// 2 BT17-028: 相手は相手のセキュリティを上から1枚手札に加える
o.oppHand = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; P.battle=[{cards:['BT17-028']}]; O.security=['BT1-010','BT1-011']; O.hand=[];
  const h=${H('BT17-028', '/相手は相手のセキュリティ/')}.find(h=>/相手の手札へ/.test(h.label)); if(!h) return 'nohandler'; h.run(); return O.hand.length===1 && O.hand[0]==='BT1-010' && O.security.length===1; })()`);
// 3 ST3-12(テイマー): 【相手のターン】自分のセキュリティデジモン全てのDPを+2000
o.tamerSecDP = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['ST3-12']}]; practiceState.turn.playerIndex=1-pi;
  const v=getSecurityDigimonDP(cardIndexByNumber.get('BT1-010'), pi); practiceState.turn.playerIndex=pi; return v===cardIndexByNumber.get('BT1-010').dp+2000; })()`);
// 4 P-053: このターンの間、相手のデジモン1体と、相手のセキュリティデジモン全てのDPを-2000
await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; practiceState.fieldEffects=[]; P.battle=[{cards:['P-053']}]; O.battle=[{cards:['BT1-010']}];
  ${H('P-053', '/セキュリティデジモン/')}.find(h=>/セキュリティデジモン/.test(h.label)).run(); })()`);
await page.waitForTimeout(200);
await ev(`(() => { const O=practiceState.players[1-practiceState.viewingIndex]; fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); })()`);
await page.waitForTimeout(300);
o.oneDP = await ev(`(() => { const O=practiceState.players[1-practiceState.viewingIndex]; return getEffectiveDP(O.battle[0]) === cardIndexByNumber.get('BT1-010').dp-2000; })()`);
o.secDPfx = await ev(`(() => { const pi=practiceState.viewingIndex; return getSecurityDigimonDP(cardIndexByNumber.get('BT1-010'), 1-pi) === cardIndexByNumber.get('BT1-010').dp-2000 && getSecurityDigimonDP(cardIndexByNumber.get('BT1-010'), pi) === cardIndexByNumber.get('BT1-010').dp; })()`);
// 5 P-181(表向きのセキュリティ): ローヤルベースのデジモンカードに進化するとき-1
o.p181 = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; practiceState.turn.playerIndex=pi; P.battle=[{cards:['BT1-010']}]; P.security=[{n:'P-181',u:1}];
  const rb=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /ローヤルベース/.test(c.type||''));
  const a=collectCostReductions('evolve', rb, {pi, target:P.battle[0]}).some(r=>/セキュリティ/.test(r.label) && r.n===1);
  P.security=['P-181']; const b=!collectCostReductions('evolve', rb, {pi, target:P.battle[0]}).some(r=>/セキュリティ/.test(r.label)); return a && b; })()`);
// 6 BT20-052: ［セキュリティ］【相手のターン終了時】このカードを登場させる(表向きのときだけ)
o.secTrigger = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[]; P.raising=null; practiceState.players[1-pi].battle=[]; practiceState.players[1-pi].raising=null; P.security=[{n:'BT20-052',u:1}];
  const list=collectBoardTriggers(x => x===pi ? ['相手のターン終了時'] : [], 'end'); const e=list.find(x=>x.cardNumber==='BT20-052'); if(!e) return 'notrigger';
  const hs=getEffectHandlers(e); const h=hs.find(h=>/登場/.test(h.label)); P.security=['BT20-052']; const none=!collectBoardTriggers(x => x===pi ? ['相手のターン終了時'] : [], 'end').length;
  return !!h && none; })()`);
// 7 EX10-061: 表向きのダークマスターズ(名称が異なるもの)を下に置いて1枚ごとに-4
const dms = await ev(`(() => { const seen=new Set(); return [...cardIndexByNumber.values()].filter(c=>/ダークマスターズ/.test(c.type||'') && c.number!=='EX10-061' && !seen.has(c.name) && seen.add(c.name)).slice(0,2).map(c=>c.number); })()`);
o.ex10061 = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; practiceState.turn.playerIndex=pi; P.battle=[]; P.security=[{n:'${dms[0]}',u:1},{n:'${dms[1]}',u:1},'BT1-010'];
  const r=collectCostReductions('play', cardIndexByNumber.get('EX10-061'), {pi}).find(x=>/下に置く/.test(x.label)); if(!r) return 'nored';
  if (r.n!==8) return 'n='+r.n; r.onPick(); P.hand=['EX10-061']; return 'ok'; })()`);
// 登場まで流す(軽減の行を選ぶ)
await ev(`appearFromHand(0, 'EX10-061', centerPoint(), false)`);
await page.waitForTimeout(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && /下に置く/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(400);
o.ex10061played = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const st=P.battle.find(s=>cardEntryNum(s.cards[s.cards.length-1])==='EX10-061'); return !!st && st.cards.length===3 && P.security.length===1; })()`);
// 8 BT19-053: ローヤルベースのデジモンがバトル以外で離れるとき、代わりにセキュリティの下に表向きで
o.bt19053 = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const rb=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /ローヤルベース/.test(c.type||'') && c.number!=='BT19-053');
  P.battle=[{cards:['BT19-053']},{cards:['BT1-010', rb.number]}]; P.security=['BT1-010']; P.trash=[];
  const acts=leaveRedirectActions(P.battle[1], ()=>{}); if(acts.length!==1) return 'acts='+acts.length; acts[0].onClick();
  const last=P.security[P.security.length-1]; return P.battle.length===1 && cardEntryNum(last)===rb.number && cardEntryFaceUp(last) && P.trash.length===1 && leaveRedirectActions(P.battle[0], ()=>{}).length===1; })()`);
const ng = Object.entries(o).filter(([k, x]) => x !== true && x !== 'ok').map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
