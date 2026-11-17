// 💸 代償を払って登場/進化(登場/進化の画面の金色の行): 払ったらそのまま軽減後のコストで確定する
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; practiceState.turn.phase='main'; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const setup = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; practiceState.memory=0; ${js}; renderPracticeBoard(); })()`); await settle(); };
const payRow = () => page.evaluate(() => { const b = document.querySelector('#evolveRouteModal.open .eri-pay'); return b ? b.innerText.replace(/\s+/g, ' ') : null; });
const clickPay = (i = 0) => page.evaluate((i) => { document.querySelectorAll('#evolveRouteModal.open .eri-pay')[i].click(); }, i);
const mem = () => ev(`practiceState.memory`); // 手番(pi)が払うと相手側へ動く
const spent = async () => { const m = await mem(); return pi === 0 ? m : -m; };
// 盤面で選ぶ
const pickStack = (js) => ev(`(() => { if (!fieldPickMode) return 'nopick'; const P=practiceState.players[${pi}]; fieldPickMode.selected=[${js}]; finishFieldPick(); return true; })()`);
const pickRows = async (re, btnRe) => {
  await page.waitForTimeout(120);
  await page.evaluate(([re, btnRe]) => { [...document.querySelectorAll('#detailBody .cmp-row')].filter(r => new RegExp(re).test(r.textContent)).forEach(r => r.click());
    const b = [...document.querySelectorAll('#detailBody button')].find(x => new RegExp(btnRe).test(x.textContent) && !x.disabled); b && b.click(); }, [re, btnRe]);
  await page.waitForTimeout(200);
};
const destroyOk = () => page.evaluate(() => { const b = [...document.querySelectorAll('#attackBarActs button')].find(x => /そのまま消滅/.test(x.textContent)); b && b.click(); return !!b; });

// 1 ギズモン:XT(BT13-086): Lv.4を消滅 → 9-6=3
await setup(`P.hand=['BT13-086']; P.battle=[{cards:['BT1-015']},{cards:['BT1-021']}]; P.trash=[]`);
await ev(`appearFromHand(0, 'BT13-086', null, false, {})`); await page.waitForTimeout(150);
o.gizRow = await payRow();
await clickPay(); await page.waitForTimeout(150);
o.gizCands = await ev(`fieldPickMode ? fieldPickMode.candidates.map(st=>getStackTopCard(st).number).join() : 'none'`);
await pickStack('P.battle[0]'); await page.waitForTimeout(200);
await destroyOk(); await page.waitForTimeout(400);
o.giz = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.map(st=>getStackTopCard(st).number).sort().join()+' trash='+P.trash.join(); })()`);
o.gizSpent = await spent();
o.ok_giz = /9.*3/.test(o.gizRow || '') && o.gizCands === 'BT1-015' && o.giz === 'BT1-021,BT13-086 trash=BT1-015' && o.gizSpent === 3;

// 2 メタルグレイモン(EX9-011): 手札のサイボーグ型/Ver.1を1枚破棄 → 7-2=5
await setup(`P.hand=['EX9-011','AD1-003','BT1-015']; P.battle=[]; P.trash=[]`);
await ev(`appearFromHand(0, 'EX9-011', null, false, {})`); await page.waitForTimeout(150);
await clickPay(); await pickRows('メガログラウモン', '破棄する');
await page.waitForTimeout(200);
o.mg = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.map(st=>getStackTopCard(st).number).join()+' hand='+P.hand.join()+' trash='+P.trash.join(); })()`);
o.mgSpent = await spent();
o.ok_mg = o.mg === 'EX9-011 hand=BT1-015 trash=AD1-003' && o.mgSpent === 5;

// 3 アポカリモン(EX10-061): 表向きのセキュリティのダークマスターズを自分で選ぶ(2枚) → 17-8=9、下に置く
await setup(`P.hand=['EX10-061']; P.battle=[]; P.security=[{n:'BT15-031',u:true},{n:'BT15-052',u:true}, ...P.security.slice(0,2)]`);
await ev(`appearFromHand(0, 'EX10-061', null, false, {})`); await page.waitForTimeout(150);
o.apoAuto = await page.evaluate(() => /表向きのセキュリティ2枚/.test(document.getElementById('evolveRouteModal').innerText)); // 自動の行は無くなった
await clickPay(); await pickRows('ピノッキモン|メタルシードラモン', '下に置く');
await page.waitForTimeout(200);
o.apo = await ev(`(() => { const P=practiceState.players[${pi}]; const st=P.battle[0]; return st ? st.cards.map(cardEntryNum).join()+' sec='+P.security.length : 'none'; })()`);
o.apoSpent = await spent();
o.ok_apo = !o.apoAuto && o.apo === 'BT15-031,BT15-052,EX10-061 sec=2' && o.apoSpent === 9;

// 4 ≪吸収進化-2≫ アルゴモン(BT2-045): 進化先を選んだあと、ほかの自分のデジモンをレスト → 進化コスト2-2=0
const greenLv3 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===3 && c.color.length===1 && c.color[0]==='green' && !/【登場時】/.test(c.effect||'')).number`);
await setup(`P.hand=['BT2-045']; P.battle=[{cards:['${greenLv3}']},{cards:['BT1-015']}]`);
await ev(`(() => { enterEvolveMode(0, 'BT2-045', false, {}); performEvolve(practiceState.players[${pi}].battle[0]); })()`); await page.waitForTimeout(150);
o.argoRow = await payRow();
await clickPay(); await page.waitForTimeout(150);
await pickStack('P.battle[1]'); await page.waitForTimeout(300);
o.argo = await ev(`(() => { const P=practiceState.players[${pi}]; return getStackTopCard(P.battle[0]).number+' rested='+!!P.battle[1].rested; })()`);
o.argoSpent = await spent();
o.ok_argo = /吸収進化-2/.test(o.argoRow || '') && o.argo === 'BT2-045 rested=true' && o.argoSpent === 0;

// 5 ダークドラモン(EX3-054): トラッシュのD-ブリガードを2枚デッキの上へ → 1枚ごとに-1 → 5-2=3
const blackLv5 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===5 && c.color.length===1 && c.color[0]==='black' && !/【登場時】/.test(c.effect||'')).number`);
await setup(`P.hand=['EX3-054']; P.battle=[{cards:['${blackLv5}']}]; P.trash=['BT14-056','BT14-060','BT1-015']`);
await ev(`(() => { enterEvolveMode(0, 'EX3-054', false, {}); performEvolve(practiceState.players[${pi}].battle[0]); })()`); await page.waitForTimeout(150);
await clickPay(); await pickRows('コマンドラモン', '戻す|置く|決定');
await page.waitForTimeout(300);
o.dd = await ev(`(() => { const P=practiceState.players[${pi}]; return getStackTopCard(P.battle[0]).number+' trash='+P.trash.join(); })()`);
o.ddSpent = await spent();
o.ok_dd = o.dd === 'EX3-054 trash=BT1-015' && o.ddSpent === 3;

// 6 ダークドラモン(BT16-065): 「バンチョーがいるなら-6」は今までどおり軽減のルート、代償(D-ブリガード6枚)は金色の行
await setup(`P.hand=['BT16-065']; P.battle=[]`);
await ev(`appearFromHand(0, 'BT16-065', null, false, {})`); await page.waitForTimeout(150);
o.bt16 = await page.evaluate(() => document.getElementById('evolveRouteModal').innerText.replace(/\s+/g, ' '));
o.ok_bt16 = /代償を払って登場/.test(o.bt16) && /D-ブリガード/.test(o.bt16);
await page.evaluate(() => document.getElementById('evolveRouteModal').classList.remove('open'));

// 7 リーパー(EX2-055): マザー デ・リーパーの進化元を下から7枚破棄 → コスト0
await setup(`P.hand=['EX2-055']; P.battle=[{cards:['BT1-015','BT1-015','BT1-015','BT1-015','BT1-015','BT1-015','BT1-015','EX2-007']}]; P.trash=[]`);
await ev(`appearFromHand(0, 'EX2-055', null, false, {})`); await page.waitForTimeout(150);
await clickPay(); await page.waitForTimeout(150);
await pickStack('P.battle[0]'); await page.waitForTimeout(300);
o.reaper = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.length+' src='+(P.battle[0].cards.length-1)+' trash='+P.trash.length; })()`);
o.reaperSpent = await spent();
o.ok_reaper = o.reaper === '2 src=0 trash=7' && o.reaperSpent === 0;
// 8 デスモン(BT25-076): 進化元にネガーモンがある、「ネガーモン」の記述があるコスト7のアイズモンを消滅 → 12-7=5
await setup(`P.hand=['BT25-076']; P.battle=[{cards:['EX9-005','EX9-047']}]; P.trash=[]`);
await ev(`appearFromHand(0, 'BT25-076', null, false, {})`); await page.waitForTimeout(150);
await clickPay(); await page.waitForTimeout(150);
await pickStack('P.battle[0]'); await page.waitForTimeout(200);
await destroyOk(); await page.waitForTimeout(400);
o.desu = await ev(`practiceState.players[${pi}].battle.map(st=>getStackTopCard(st).number).join()`);
o.desuSpent = await spent();
o.ok_desu = o.desu === 'BT25-076' && o.desuSpent === 5;
// 9 シャウトモンX7:SM(BT21-030): シャウトモン1体を下に置く → 15-1=14 は上限超え → 払う前に止める。メモリー+5 から始めれば払える
await setup(`P.hand=['BT21-030']; P.battle=[{cards:['BT1-009','BT10-008']}]; P.trash=[]; practiceState.memory = ${pi === 0 ? -5 : 5}`);
await ev(`appearFromHand(0, 'BT21-030', null, false, {})`); await page.waitForTimeout(150);
await clickPay(); await page.waitForTimeout(150);
await pickStack('P.battle[0]'); await page.waitForTimeout(300);
o.sm = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle.map(st=>st.cards.map(cardEntryNum).join('+')).join()+' trash='+P.trash.join(); })()`);
o.ok_sm = o.sm === 'BT10-008+BT21-030 trash=BT1-009';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
