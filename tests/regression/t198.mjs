// 「この効果で破棄した1枚ごとに」の数を自動で入れる / 「置いたカードと同じLv.」(EX6-066・EX9-055)
// EX6-060(レストの数) P-089(下から選んで破棄) BT26-083(セキュリティ全て→消滅の数) BT14-078(選べるLv.+1) BT20-077(手札が4枚になるように・DP上限-2000)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
// 効果のエントリを作って window.__e に置く
const mkE = (num, timing) => ev(`(() => { const P=practiceState.players[${pi}]; const c=cardIndexByNumber.get('${num}'); const lines=c.effect.split('\\n'); const li=lines.findIndex(l=>l.includes('${timing}'));
  const st=P.battle.find(s=>cardEntryNum(s.cards[s.cards.length-1])==='${num}');
  window.__e={ownerIndex:${pi}, stackUid:st?ensureStackUid(st):null, cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:li, text:parseEffectLine(lines[li]).text, timing:'${timing}', event:'t'}; return true; })()`);
const labels = () => ev(`effectHandlersWithConds(window.__e).handlers.map(h=>h.label).join('|')`);
const press = (re) => ev(`(() => { const h=effectHandlersWithConds(window.__e).handlers.find(h=>${re}.test(h.label)); if(!h) return false; h.run(); return true; })()`);
// 選ぶ画面で n 行を選んで、ボタン(re)を押す
const pickRows = async (n, btnRe, rowRe) => {
  await page.waitForTimeout(120);
  await page.evaluate(([n, rowRe]) => { let rows=[...document.querySelectorAll('#detailBody .cmp-row')]; if (rowRe) rows=rows.filter(r=>new RegExp(rowRe).test(r.textContent)); rows.slice(0,n).forEach(r=>r.click()); }, [n, rowRe || null]);
  await page.waitForTimeout(60);
  await page.evaluate((btnRe) => { const b=[...document.querySelectorAll('#detailBody button')].find(x=>new RegExp(btnRe).test(x.textContent) && !x.disabled); b && b.click(); }, btnRe);
  await page.waitForTimeout(150);
};
const setup = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; ${js}; renderPracticeBoard(); })()`); await settle(); };

// 1 EX9-055: トラッシュのLv.4を進化元の上に置く → 「Lv.4の相手のデジモン1体を消滅」
await setup(`P.battle=[{cards:['BT1-016','EX9-055']}]; P.trash=['EX9-047']; O.battle=[{cards:['BT1-015']},{cards:['BT1-021']}]`);
await mkE('EX9-055', 'お互いのターン終了時');
await press('/代償/');
await page.waitForTimeout(150);
await page.evaluate(() => { const r=[...document.querySelectorAll('#detailBody .eep-row, #detailBody .cmp-row')].find(x=>/アイズモン/.test(x.textContent)); r && r.click(); const g=document.querySelector('#detailBody .eep-go'); g && g.click(); });
await page.waitForTimeout(80);
await page.evaluate(() => { const b=[...document.querySelectorAll('#detailBody button')].find(x=>/置く|決定/.test(x.textContent) && !x.disabled); b && b.click(); });
await page.waitForTimeout(150);
o.ex9moved = await ev(`JSON.stringify(window.__e.costMovedNums)`);
o.ex9label = /Lv\.4の相手のデジモン1体を消滅/.test(await labels());
// 1b EX6-066: 手札の水棲Lv.4を青のデジモンの進化元の下に置く → 「Lv.4の相手のデジモン全てを手札に戻す」
await setup(`P.battle=[{cards:['BT1-030','BT1-040']}]; P.hand=['BT15-025']; P.trash=[]`);
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle.push({cards:['EX6-066']}); renderPracticeBoard(); })()`); await settle();
await mkE('EX6-066', 'メイン');
await press('/代償/'); await page.waitForTimeout(150);
await page.evaluate(() => { const g=document.querySelector('#detailBody .eep-go'); if (g) g.click(); else { const r=document.querySelector('#detailBody .cmp-row'); r && r.click(); const b=[...document.querySelectorAll('#detailBody button')].find(x=>/置く|決定/.test(x.textContent) && !x.disabled); b && b.click(); } });
await page.waitForTimeout(150);
if (await ev('!!fieldPickMode')) { await ev(`(() => { fieldPickMode.selected=[practiceState.players[${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(150); }
o.ex6066 = await ev(`JSON.stringify(window.__e.costMovedNums)`);
o.ok_ex6066 = o.ex6066 === '["BT15-025"]' && /Lv\.4の相手のデジモン全てを手札に戻す/.test(await labels());
// 2 EX6-060: 手札を2枚破棄 → レストできる数が2
await setup(`P.battle=[{cards:['BT1-016','EX6-060']}]; P.hand=['BT1-009','BT1-012','BT1-013']; O.battle=[{cards:['BT1-015']},{cards:['BT1-016']},{cards:['BT1-014']}]`);
await mkE('EX6-060', '登場時');
o.ex6upTo = /手札を3枚まで破棄/.test(await labels());
await press('/手札を3枚まで破棄/'); await pickRows(2, '破棄する');
o.ex6count = await ev('window.__e.costDiscardCount');
await press('/レスト/'); await page.waitForTimeout(200);
o.ex6max = await ev('fieldPickMode ? fieldPickMode.max : null');
await ev('cancelTargetModes()');
// 3 P-089: 青を1枚破棄 → 相手の下から1枚選んで破棄
await setup(`P.battle=[{cards:['BT1-016','P-089']}]; P.hand=['BT1-028','BT1-030']; O.battle=[{cards:['BT1-009','BT1-015']}]; O.trash=[]`);
await mkE('P-089', '進化時');
await press('/青のカードを3枚まで破棄/'); await pickRows(1, '破棄する');
o.p089label = /下から選んで1枚破棄/.test(await labels());
await press('/下から選んで/'); await page.waitForTimeout(150);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(150);
await page.evaluate(() => { const g=document.querySelector('#detailBody .eep-go'); g && g.click(); }); await page.waitForTimeout(200);
o.p089done = await ev(`(() => { const O=practiceState.players[1-${pi}]; return O.battle[0].cards.length===1 && O.trash.includes('BT1-009'); })()`);
// 4 BT26-083: セキュリティを全て破棄(3枚) → 消滅させる数が3
await setup(`P.battle=[{cards:['BT1-016','BT26-083']}]; P.security=P.security.slice(0,3); O.battle=[{cards:['BT1-015']},{cards:['BT1-016']},{cards:['BT1-014']},{cards:['BT1-021']}]`);
await mkE('BT26-083', '登場時');
await press('/セキュリティを全て破棄/'); await page.waitForTimeout(150);
o.bt26count = await ev(`window.__e.costDiscardCount === 3 && practiceState.players[${pi}].security.length === 0`);
await press('/消滅/'); await page.waitForTimeout(200);
o.bt26max = await ev('fieldPickMode ? fieldPickMode.max : null');
await ev('cancelTargetModes()');
// 5 BT14-078: 魔獣型を2枚破棄 → Lv.5以下を選べる
await setup(`P.battle=[{cards:['BT1-016','BT14-078']}]; P.hand=['BT1-039','BT12-076']; O.battle=[{cards:['BT1-009']},{cards:['BT1-021']},{cards:['BT1-016']},{cards:['BT1-025']}]`);
await mkE('BT14-078', '消滅時');
await press('/破棄/'); await pickRows(2, '破棄する');
await press('/消滅/'); await page.waitForTimeout(200);
o.bt14cands = await ev(`fieldPickMode ? fieldPickMode.candidates.map(st=>getStackTopCard(st).level).sort().join() : 'none'`);
await ev('cancelTargetModes()');
// 6 BT20-077: 手札6枚 → 4枚になるように2枚破棄 → DP上限8000-4000=4000
await setup(`P.battle=[{cards:['BT1-016','BT20-077']}]; P.hand=['BT1-009','BT1-012','BT1-013','BT1-014','BT1-015','BT1-016']; P.trash=['BT1-009','BT1-021']`);
await mkE('BT20-077', '登場時');
o.bt20label = /手札が4枚になるように破棄\(2枚\)/.test(await labels());
await press('/4枚になるように/'); await pickRows(2, '破棄する');
o.bt20hand = await ev(`practiceState.players[${pi}].hand.length`);
await press('/トラッシュから登場/'); await page.waitForTimeout(200);
o.bt20list = await page.evaluate(() => [...document.querySelectorAll('#detailBody .eep-row')].filter(r => !r.classList.contains('ng') && !r.classList.contains('dim')).map(r => r.textContent.replace(/\s+/g, '').slice(0, 14)).join(','));
o.bt20sub = await page.evaluate(() => (document.getElementById('detailBody').innerText.match(/DP\d+以下/) || [''])[0]);
await page.evaluate(() => document.getElementById('cardDetailModal').classList.remove('open'));

o.ok_ex9 = o.ex9moved === '["EX9-047"]' && o.ex9label;
o.ok_ex6 = o.ex6upTo && o.ex6count === 2 && o.ex6max === 2;
o.ok_p089 = o.p089label && o.p089done;
o.ok_bt26 = o.bt26count && o.bt26max === 3;
o.ok_bt14 = o.bt14cands === '3,4,5';
o.ok_bt20 = o.bt20label && o.bt20hand === 4 && o.bt20sub === 'DP4000以下';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
