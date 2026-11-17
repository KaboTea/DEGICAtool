// ⛨「相手の効果を受けない」を持つデジモン(ラグナモン EX11-046 など)は、相手の効果で選べるが、影響は受けない(15-15-5-3)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const setup = async () => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-015']}]; O.battle=[{cards:['EX11-046']},{cards:['BT1-016']}]; O.trash=[]; renderPracticeBoard(); })()`); await settle();
  await ev(`(() => { const O=practiceState.players[1-${pi}]; setResist(O.battle[0], 'immuneOpp', 'oppTurnEnd', true); renderPracticeBoard(); })()`); };
const hs = (text) => `getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(practiceState.players[${pi}].battle[0]), cardNumber:'BT1-015', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'})`;
// 1 消滅: 候補には入る → 選んでも消滅しない
await setup();
await ev(`${hs('【メイン】相手のデジモン1体を消滅させる。')}.find(h=>/消滅/.test(h.label)).run()`); await page.waitForTimeout(150);
o.cand = await ev(`fieldPickMode ? fieldPickMode.candidates.includes(practiceState.players[1-${pi}].battle[0]) : 'nopick'`);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(300);
o.alive = await ev(`practiceState.players[1-${pi}].battle.some(st=>getStackTopCard(st).number==='EX11-046')`);
// 2 DP-: 下がらない
await setup();
const dp0 = await ev(`getEffectiveDP(practiceState.players[1-${pi}].battle[0])`);
await ev(`${hs('【メイン】このターンの間、相手のデジモン1体をDP-3000する。')}.find(h=>/DP-3000/.test(h.label)).run()`); await page.waitForTimeout(150);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(200);
o.dpSame = (await ev(`getEffectiveDP(practiceState.players[1-${pi}].battle[0])`)) === dp0;
// 3 全て: 耐性のないほうだけ消滅
await setup();
await ev(`${hs('【メイン】相手のデジモン全てを消滅させる。')}.find(h=>/消滅/.test(h.label)).run()`); await page.waitForTimeout(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('#attackBarActs button')].find(x=>/そのまま消滅/.test(x.textContent)); b && b.click(); }); await page.waitForTimeout(300);
o.all = await ev(`practiceState.players[1-${pi}].battle.map(st=>getStackTopCard(st).number).join()`);
// 4 自分の効果(耐性の持ち主側)は止めない
await ev(`(() => { const O=practiceState.players[1-${pi}]; return true; })()`);
o.ok = o.cand === true && o.alive === true && o.dpSame === true && o.all === 'EX11-046';
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
