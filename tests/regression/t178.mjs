// v0.97.5: 「〜ごとに」で対象の数・上限・枚数が変わる効果、コストを払う手札からの登場(〜ごとにコスト-N)、自分のDPアップ、「選んだデジモンと同じLv.」
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const H = (num, re, holderIdx = 0) => `(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi]; const c=cardIndexByNumber.get('${num}');
  const line=c.effect.split('\\n').find(l=>${re}.test(l)); return getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[${holderIdx}]), cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'x', event:'t'}); })()`;
const dig = (pred) => ev(`[...cardIndexByNumber.values()].filter(c=>c.category==='digimon' && (${pred})).map(c=>c.number)`);
const setup = (js) => ev(`(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; practiceState.turn.phase='main'; practiceState.memory=0; clearEffectQueue(); ${js}; renderPracticeBoard(); })()`);
const fp = () => ev(`fieldPickMode ? { n: fieldPickMode.candidates.length, max: fieldPickMode.max } : null`);
const lv3 = await dig(`c.level===3 && c.play_cost<=3`), lv5 = await dig(`c.level===5 && c.play_cost>=7`);
// 1 BT18-056: 表向きのセキュリティ2枚 → 2体までレスト
await setup(`P.battle=[{cards:['BT18-056']}]; P.security=[{n:'BT1-010',u:1},{n:'BT1-019',u:1},'BT1-053']; O.battle=[{cards:['${lv3[0]}']},{cards:['${lv3[1]}']},{cards:['${lv3[2]}']}]`);
await ev(`${H('BT18-056', '/ごとに、相手のデジモン1体をレスト/')}.find(h=>/レスト/.test(h.label)).run()`);
o.restMax2 = (await fp()).max === 2;
await ev(`cancelFieldPick()`);
// 2 BT19-052: 表向き2枚 → 登場コスト6以下
const c6 = await dig(`c.play_cost===6`), c7 = await dig(`c.play_cost===8`);
await setup(`P.battle=[{cards:['BT19-052']}]; P.security=[{n:'BT1-010',u:1},{n:'BT1-019',u:1}]; O.battle=[{cards:['${c6[0]}']},{cards:['${c7[0]}']}]`);
await ev(`${H('BT19-052', '/登場コスト上限/')}.find(h=>/消滅/.test(h.label)).run()`);
o.cost6 = await ev(`(() => { const r = fieldPickMode && fieldPickMode.candidates.length===1 && getStackTopCard(fieldPickMode.candidates[0]).play_cost===6; if (fieldPickMode) cancelFieldPick(); return r; })()`);
// 3 BT17-018: トラッシュ合計25枚 → 2枚破棄
await setup(`P.battle=[{cards:['BT17-018']}]; P.trash=Array(15).fill('BT1-010'); O.trash=Array(10).fill('BT1-010'); O.security=['BT1-010','BT1-019','BT1-053','BT1-085']`);
await ev(`${H('BT17-018', '/ごとに、相手のセキュリティ/')}.find(h=>/セキュリティ/.test(h.label)).run()`);
o.sec2 = await ev(`practiceState.players[1-practiceState.turn.playerIndex].security.length === 2`);
// 4 BT18-016: このデジモンをDP+2000
await setup(`P.battle=[{cards:['BT18-016']}]`);
const dp0 = await ev(`getEffectiveDP(practiceState.players[practiceState.turn.playerIndex].battle[0])`);
await ev(`${H('BT18-016', '/DP\\+2000/')}.find(h=>/💪/.test(h.label)).run()`);
o.selfDP = (await ev(`getEffectiveDP(practiceState.players[practiceState.turn.playerIndex].battle[0])`)) === dp0 + 2000;
// 5 BT17-078: 選んだデジモンと同じLv.
await setup(`P.battle=[{cards:['BT17-078']}]; O.battle=[{cards:['${lv3[0]}']},{cards:['${lv3[1]}']},{cards:['${lv5[0]}']}]`);
await ev(`${H('BT17-078', '/同じLv/')}.find(h=>/同じLv/.test(h.label)).run()`);
await ev(`(() => { const O=practiceState.players[1-practiceState.turn.playerIndex]; fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); })()`);
await page.waitForTimeout(300);
o.sameLv = await ev(`(() => { const O=practiceState.players[1-practiceState.turn.playerIndex]; return O.battle.length===1 && getStackTopCard(O.battle[0]).level===5; })()`);
// 6 EX11-034: 手札から登場(表向き2枚 → コスト-2)
const lab = await ev(`(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi]; P.battle=[{cards:['EX11-034']}]; return ${H('EX11-034', '/この効果で支払う登場コスト/')}.map(h=>h.label).join('|'); })()`);
o.playBtn = /手札から登場\(自分の表向きのセキュリティ1枚ごとにコスト-1\)/.test(lab);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
