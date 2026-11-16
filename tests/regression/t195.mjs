// BT7-040(≪デジバースト4枚まで≫・破棄した枚数ごとにDP-3000・進化コスト=セキュリティ枚数) / BT18-083(DP以下のデジモン全てに≪衝突≫)
// BT8-070(進化元の色でデジモン/テイマーを選べる合計除去) / BT25-101(このカードかトラッシュのカードをリンク)
import { page, ev, errs, browser, bar } from '../head.mjs';
// 盤面に直接置いたカードの【登場時】で視点が変わらないよう、置いたあとは効果を片付けて手番側の視点に戻す
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const hs = (num, f, stackExpr, pick) => `(() => { const c=cardIndexByNumber.get('${num}'); const st=${stackExpr}; const tr=collectStackTriggers(st, ${pi}, 'battle', ['${pick}'], {event:'t'})[0]; window.__e=tr; return effectHandlersWithConds(tr).handlers; })()`;
// 1 BT7-040: 4枚まで → 2枚破棄 → DP-6000
await ev(`(() => { practiceState.viewingIndex=${pi}; const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-010','BT1-019','AD1-015','BT7-040']}]; O.battle=[{cards:['BT25-075']}]; renderPracticeBoard(); })()`); await settle();
o.burstLabel = await ev(`${hs('BT7-040','effect','practiceState.players['+pi+'].battle[0]','メイン')}.map(h=>h.label).join('|')`);
o.burstUpTo = /4枚まで破棄/.test(o.burstLabel) && /破棄したカード1枚ごとにDP-3000/.test(o.burstLabel);
await ev(`${hs('BT7-040','effect','practiceState.players['+pi+'].battle[0]','メイン')}.find(h=>/代償/.test(h.label)).run()`);
await page.waitForTimeout(200);
await page.evaluate(() => { const rows=[...document.querySelectorAll('#detailBody .cmp-row')]; rows.slice(0,2).forEach(r=>r.click()); });
await page.waitForTimeout(100);
o.pickedRows = await page.evaluate(() => document.querySelectorAll('#detailBody .cmp-row.on').length);
await page.evaluate(() => { const b=[...document.querySelectorAll('#detailBody button')].find(x=>/破棄する/.test(x.textContent) && !x.disabled); b && b.click(); });
await page.waitForTimeout(200);
o.count = await ev('window.__e.costDiscardCount');
await ev(`effectHandlersWithConds(window.__e).handlers.find(h=>/DP-3000/.test(h.label)).run()`); await page.waitForTimeout(200);
if (await ev('!!fieldPickMode')) { await ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(200); }
o.perBar = await bar();
o.perAuto = /× 2 = DP-6000/.test(o.perBar) && /自動で数えた数: 2/.test(o.perBar);
await page.evaluate(() => [...document.querySelectorAll('#attackBarActs button')].find(b=>/^決定/.test(b.textContent)).click()); await page.waitForTimeout(200);
o.dpApplied = await ev(`getEffectiveDP(practiceState.players[1-${pi}].battle[0]) === 6000`);
// 2 BT7-040 進化コスト = セキュリティ枚数(0なら1)
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['AD1-015']}]; P.hand=['BT7-040']; P.security=P.security.slice(0,3); renderPracticeBoard(); })()`); await settle();
o.evoCost = await ev(`(() => { const P=practiceState.players[${pi}];
  enterEvolveMode(0, 'BT7-040', false, {}); performEvolve(P.battle[0]); const txt=document.getElementById('evolveRouteModal').innerText; document.getElementById('evolveRouteModal').classList.remove('open'); cancelTargetModes(); return /自身の効果/.test(txt) && /コスト\\s*3|3\\s*コスト|コスト3/.test(txt) ? true : txt.slice(0,300); })()`);
// 3 BT18-083: DP以下(お互い)は衝突、DPが上なら付かない
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT18-083']},{cards:['BT1-010']}]; O.battle=[{cards:['BT1-010']},{cards:['BT1-010'], dpModifier: 20000}]; renderPracticeBoard(); })()`); await settle();
o.collision = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}];
  return [hasCollisionKeyword(P.battle[0]), hasCollisionKeyword(P.battle[1]), hasCollisionKeyword(O.battle[0]), hasCollisionKeyword(O.battle[1])].join(); })()`);
o.collisionOk = o.collision === 'true,true,true,false';
// 4 BT8-070: 進化元が赤だけ → デジモンだけ選べる / 黒も → テイマーも
const gate = (mats) => ev(`(() => { cancelTargetModes(); const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:[...${JSON.stringify(mats)}, 'BT8-070']}]; O.battle=[{cards:['BT1-010']},{cards:['AD1-019']}]; renderPracticeBoard(); })()`).then(settle).then(() => ev(`(() => { const P=practiceState.players[${pi}];
  const c=cardIndexByNumber.get('BT8-070'); const line=c.effect.split('\\n')[0];
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT8-070', cardName:c.name, field:'effect', lineIndex:0, text:parseEffectLine(line).text, timing:'進化時', event:'t'}).find(x=>/🧮/.test(x.label));
  if (!h) return 'nobtn'; h.run(); if (!fieldPickMode) return 'nopick'; const r=fieldPickMode.candidates.map(st=>getStackTopCard(st).category).sort().join(); cancelTargetModes(); return r; })()`));
o.gateRed = await gate(['AD1-002']);
o.gateBoth = await gate(['AD1-002', 'BT10-064']);
o.gateOk = o.gateRed === 'digimon' && o.gateBoth === 'digimon,tamer';
// 5 BT25-101: 選ぶ画面に[このカード]と[トラッシュ]のTSカード
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT25-075']},{cards:['BT25-101']}]; P.trash=['BT24-009','BT1-010']; renderPracticeBoard(); })()`); await settle();
o.link = await ev(`(() => { const P=practiceState.players[${pi}];
  const c=cardIndexByNumber.get('BT25-101'); const line=c.effect.split('\\n').find(l=>/リンク/.test(l) && /【メイン】/.test(l));
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[1]), cardNumber:'BT25-101', cardName:c.name, field:'effect', lineIndex:2, text:parseEffectLine(line).text, timing:'メイン', event:'使用'}).find(x=>/🔗/.test(x.label));
  if (!h) return 'nobtn'; h.run(); const txt=document.getElementById('detailBody').innerText; return /このカード/.test(txt) && /トラッシュ/.test(txt) && /このカード・/.test(h.label); })()`);
await page.evaluate(() => { const r=[...document.querySelectorAll('#detailBody .cmp-row')].find(x=>/このカード/.test(x.textContent)); r && r.click(); });
await page.waitForTimeout(100);
await page.evaluate(() => { const b=[...document.querySelectorAll('#detailBody button')].find(x=>/リンクさせる/.test(x.textContent) && !x.disabled); b && b.click(); });
await page.waitForTimeout(300);
o.linkedSelf = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.length===1 && (P.battle[0].links||[]).includes('BT25-101'); })()`);
const ng = Object.entries(o).filter(([k, x]) => !['burstLabel','pickedRows','count','perBar','collision','gateRed','gateBoth'].includes(k) && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
