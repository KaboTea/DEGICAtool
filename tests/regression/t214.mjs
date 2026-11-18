// 2026-11-18: ST21-04「テイマーの色2色ごとに、選んで1枚破棄」/ EX13-073 代償のあとの「自分の手札1枚を破棄する」
// 「Aがいるか、Bが3色以上」/ 進化元に「X抗体」(ギルモンX抗体は違う)/ 「レストせずアタックできる」(EX13-077)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const H = (num, text) => `getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(practiceState.players[${pi}].battle[0]), cardNumber:'${num}', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'x', event:'t'})`;
// 1 ST21-04: 2色のテイマー2体(4色) → 2枚
const tam = await ev(`[...cardIndexByNumber.values()].filter(c=>c.category==='tamer'&&c.color.length===2).slice(0,2).map(c=>c.number)`);
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','ST21-04']},{cards:['${tam[0]}']},{cards:['${tam[1]}']}]; O.battle=[{cards:['BT1-009','BT1-010','BT1-015','BT1-016']}]; O.trash=[]; renderPracticeBoard(); clearEffectQueue(); practiceState.viewingIndex=${pi}; })()`);
o.cols = await ev(`countPerUnit('自分のテイマーの色2色', ${pi}, null, null)`);
await ev(`${H('ST21-04', '相手のデジモン1体の進化元を自分のテイマーの色2色ごとに、選んで1枚破棄する。')}.find(h=>/進化元を/.test(h.label)).run()`);
await page.waitForTimeout(100);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[0]]; finishFieldPick(); })()`); await page.waitForTimeout(150);
await page.evaluate(() => { document.querySelectorAll('#detailBody .cmp-row').forEach(r => r.click()); [...document.querySelectorAll('#detailBody button')].find(x => /破棄する/.test(x.textContent) && !x.disabled).click(); });
await page.waitForTimeout(150);
o.src = await ev(`practiceState.players[1-${pi}].trash.length`);
o.ok_src = o.src === Math.min(3, o.cols);
// 2 EX13-073: 代償(レスト)のあとの手札破棄ボタン
o.btns = await ev(`${H('EX13-073', 'このテイマーをレストさせることで、≪1ドロー≫し、自分の手札1枚を破棄する。')}.map(h=>h.label).join(' / ')`);
o.ok_disc = /手札を1枚破棄/.test(o.btns) && /1枚ドロー/.test(o.btns);
// 3 「Aがいるか、B」
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[]; O.battle=[]; })()`);
const C = 'DP10000以上の相手のデジモンがいるか、自分のテイマーの色合計が3色以上';
o.orF = await ev(`String(evalEffectCondition(${JSON.stringify(C)}, null, ${pi}))`);
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['${tam[0]}']},{cards:['${tam[1]}']}]; })()`);
o.orT = await ev(`String(evalEffectCondition(${JSON.stringify(C)}, null, ${pi}))`);
o.ok_or = o.orF === 'false' && o.orT === String(o.cols >= 1 && await ev(`evalEffectCondition('自分のテイマーの色合計が3色以上', null, ${pi})`));
// 4 進化元に「グラウモン」/「X抗体」: ギルモンX抗体だけなら合わない、X抗体(BT9-109)なら合う
const cond = 'このデジモンの進化元に「グラウモン」/「X抗体」がある';
o.xNo = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT9-009','EX8-012']}]; return String(evalEffectCondition(${JSON.stringify(cond)}, P.battle[0], ${pi})); })()`);
o.xYes = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT9-109','BT9-009','EX8-012']}]; return String(evalEffectCondition(${JSON.stringify(cond)}, P.battle[0], ${pi})); })()`);
o.ok_x = o.xNo === 'false' && o.xYes === 'true';
// 5 レストせずアタック
o.atk = await ev(`${H('EX13-077', '自分のデジモン1体でレストせずアタックできる。')}.map(h=>h.label).join(' / ')`);
o.ok_atk = /レストせずにアタック/.test(o.atk);
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
