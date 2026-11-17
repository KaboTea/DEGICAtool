// 色だけの条件(「黒の自分のテイマーがいる」) / カオスドラモン・スナッチモンのトラッシュからのデジクロス
// シャウトモンX7:SM(BT21-030)のデジクロスの画面で「シャウトモン」を下に置いて-1・トラッシュから選ぶ
// 代償の行を続けて払う(≪吸収進化≫の重ねがけ 16-10-4) / ケレスモン(BT3-056)で相手のデジモンもレストできる
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; practiceState.turn.phase='main'; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const setup = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; practiceState.memory=0; ${js}; renderPracticeBoard(); })()`); await settle(); };
const spent = async () => { const m = await ev('practiceState.memory'); return pi === 0 ? m : -m; };

// 1 色だけの条件
const blueT = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='tamer' && c.color.length===1 && c.color[0]==='blue').number`);
const cond = (t, board) => ev(`(() => { const P=practiceState.players[${pi}]; ${board}; return String(evalEffectCondition(${JSON.stringify(t)}, null, ${pi})); })()`);
o.colorY = await cond('青の自分のテイマーがいる', `P.battle=[{cards:['BT2-087']}]`);
o.colorB = await cond('青の自分のテイマーがいる', `P.battle=[{cards:['${blueT}']}]`);
o.ok_color = o.colorY === 'false' && o.colorB === 'true';
// 2 カオスドラモン: 黄のテイマーだけならトラッシュから選べない / スナッチモン: ベムモンだけなら選べる
o.chaos = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT2-087']}]; return digixrosExtraSources(cardIndexByNumber.get('BT17-057'), ${pi}).length; })()`);
o.snatch = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT11-061']}]; return digixrosExtraSources(cardIndexByNumber.get('BT18-065'), ${pi}).map(x=>x.kind).join(); })()`);
o.ok_dx = o.chaos === 0 && o.snatch === 'trash';

// 3 シャウトモンX7:SM: デジクロスの画面で「シャウトモン」を下に置く → トラッシュから材料 → コスト-1、一番下にシャウトモン
const xmat = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /クロスハート/.test(c.type||'') && c.name!=='シャウトモン' && !/【登場時】/.test(c.effect||'')).number`);
await setup(`P.hand=['BT21-030']; P.battle=[{cards:['BT1-009','BT10-008']}]; P.trash=['${xmat}']; practiceState.memory=${pi === 0 ? -9 : 9}`);
await ev(`enterMultiEvolveMode(0, 'BT21-030', 'digixros')`); await page.waitForTimeout(150);
o.smBtn = await ev(`fieldPickMode ? fieldPickMode.buttons.map(b=>b.label).join(' | ') : 'nopick'`);
await ev(`fieldPickMode.buttons.find(b=>/シャウトモン」1体を下に置いて/.test(b.label)).onClick(fieldPickMode.selected || [])`); await page.waitForTimeout(150);
await page.evaluate(() => document.querySelector('#detailBody .eep-go').click()); await page.waitForTimeout(150);
await page.evaluate(() => { document.querySelectorAll('#detailBody .cmp-row').forEach(r => r.click()); const b=[...document.querySelectorAll('#detailBody button')].find(x=>/材料に加える/.test(x.textContent) && !x.disabled); b && b.click(); });
await page.waitForTimeout(200);
o.smMid = await ev(`(() => { const P=practiceState.players[${pi}]; return 'battle='+P.battle.length+' trash='+P.trash.join()+' mats='+multiEvolveMode.handMaterials.join(); })()`);
await ev(`(() => { fieldPickMode.selected=[]; finishFieldPick(); })()`); await page.waitForTimeout(200);
o.smRoute = await page.evaluate(() => document.getElementById('evolveRouteModal').innerText.replace(/\s+/g, ' '));
await page.evaluate(() => { const b=[...document.querySelectorAll('#evolveRouteModal.open .evolve-route-item:not(.eri-pay)')].find(x=>/代償/.test(x.textContent)) || document.querySelector('#evolveRouteModal.open .evolve-route-item:not(.eri-pay)'); b.click(); });
await page.waitForTimeout(300);
o.sm = await ev(`(() => { const P=practiceState.players[${pi}]; const st=P.battle[0]; return st ? st.cards.map(cardEntryNum).join('+')+' trash='+P.trash.join() : 'none'; })()`);
o.ok_sm = /💸 代償/.test(o.smRoute) && o.smMid === `battle=0 trash=BT1-009 mats=${xmat}` && o.sm === `BT10-008+${xmat}+BT21-030 trash=BT1-009`;

// 3b 取りやめたらシャウトモンが場に戻る
await setup(`P.hand=['BT21-030']; P.battle=[{cards:['BT1-009','BT10-008']}]; P.trash=['${xmat}']`);
await ev(`enterMultiEvolveMode(0, 'BT21-030', 'digixros')`); await page.waitForTimeout(150);
await ev(`fieldPickMode.buttons.find(b=>/シャウトモン」1体を下に置いて/.test(b.label)).onClick(fieldPickMode.selected || [])`); await page.waitForTimeout(150);
await page.evaluate(() => document.querySelector('#detailBody .eep-go').click()); await page.waitForTimeout(150);
await page.evaluate(() => document.getElementById('cardDetailModal').classList.remove('open'));
await ev(`cancelMultiEvolve()`); await page.waitForTimeout(100);
o.smCancel = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.map(st=>st.cards.join('+')).join()+' trash='+P.trash.join(); })()`);
o.ok_smCancel = o.smCancel === `BT1-009+BT10-008 trash=${xmat}`;

// 4 代償の行を続けて払う: ≪吸収進化≫を2つ持つ試しのカード → 1つ払うと画面に戻り、もう1つ払うと両方引いて進化
await ev(`(() => { const b=cardIndexByNumber.get('BT2-045'); cardIndexByNumber.set('TEST-AB2', Object.assign({}, b, { number:'TEST-AB2', name:'テスト吸収', effect:'≪吸収進化-1≫\\n≪吸収進化-1≫' })); })()`);
const greenLv3 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===3 && c.color.length===1 && c.color[0]==='green' && !/【登場時】/.test(c.effect||'')).number`);
await setup(`P.hand=['TEST-AB2']; P.battle=[{cards:['${greenLv3}']},{cards:['BT1-015']},{cards:['BT1-016']}]`);
await ev(`(() => { enterEvolveMode(0, 'TEST-AB2', false, {}); performEvolve(practiceState.players[${pi}].battle[0]); })()`); await page.waitForTimeout(150);
o.ab1 = await page.evaluate(() => document.querySelectorAll('#evolveRouteModal.open .eri-pay').length);
await page.evaluate(() => document.querySelectorAll('#evolveRouteModal.open .eri-pay')[0].click()); await page.waitForTimeout(150);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[${pi}].battle[1]]; finishFieldPick(); })()`); await page.waitForTimeout(250);
o.ab2 = await page.evaluate(() => document.getElementById('evolveRouteModal').classList.contains('open') ? document.querySelectorAll('#evolveRouteModal.open .eri-pay').length : -1);
await page.evaluate(() => document.querySelector('#evolveRouteModal.open .eri-pay').click()); await page.waitForTimeout(150);
await ev(`(() => { fieldPickMode.selected=[practiceState.players[${pi}].battle[2]]; finishFieldPick(); })()`); await page.waitForTimeout(300);
o.ab = await ev(`(() => { const P=practiceState.players[${pi}]; return getStackTopCard(P.battle[0]).number+' rested='+P.battle.slice(1).map(s=>!!s.rested).join(); })()`);
o.abSpent = await spent();
o.ok_ab = o.ab1 === 2 && o.ab2 === 1 && o.ab === 'TEST-AB2 rested=true,true' && o.abSpent === 0;

// 5 ケレスモン(BT3-056)が場にいれば、≪吸収進化≫で相手のデジモンもレストできる
await setup(`P.hand=['BT2-045']; P.battle=[{cards:['${greenLv3}']},{cards:['BT3-056']}]; O.battle=[{cards:['BT1-015']}]`);
await ev(`(() => { enterEvolveMode(0, 'BT2-045', false, {}); performEvolve(practiceState.players[${pi}].battle[0]); })()`); await page.waitForTimeout(150);
await page.evaluate(() => document.querySelector('#evolveRouteModal.open .eri-pay').click()); await page.waitForTimeout(150);
o.ceres = await ev(`fieldPickMode ? fieldPickMode.candidates.some(st=>practiceState.players[1-${pi}].battle.includes(st)) : 'nopick'`);
await ev('cancelTargetModes()');
o.ok_ceres = o.ceres === true;

const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
