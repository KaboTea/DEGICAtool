// 1〜5枚ずつの書き方(2026-11-17の抜け探し): 重ねられているカードを上から / お互い1ドロー / デッキ・セキュリティを〜ごとに破棄
// お互い手札N枚 / 四大竜の試練 / 進化元を〜ごとに・まで / 条件の途中の読点
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const setup = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; ${js}; renderPracticeBoard(); })()`); await settle(); };
const press = (num, timing, re) => ev(`(() => { const P=practiceState.players[${pi}]; const c=cardIndexByNumber.get('${num}'); const f=(c.effect||'').includes('【${timing}】')?'effect':'inherited'; const l=c[f].split('\\n').find(x=>x.includes('【${timing}】'));
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:P.battle[0]?ensureStackUid(P.battle[0]):null, lki:${timing === '消滅時'}, cardNumber:'${num}', cardName:c.name, field:f, lineIndex:0, text:parseEffectLine(l).text, timing:'${timing}', event:'t'}).find(h=>${re}.test(h.label));
  if (!h) return 'nobtn'; h.run(); return true; })()`);
const pickOpp = (i) => ev(`(() => { fieldPickMode.selected=[practiceState.players[1-${pi}].battle[${i}]]; finishFieldPick(); return true; })()`);

// 1 BT21-030: 相手のデジモン(3枚)の重ねられているカードを上から10枚破棄 → 全部トラッシュ、場から離れる
await setup(`P.battle=[{cards:['BT1-009','BT21-030']}]; O.battle=[{cards:['BT1-009','BT1-010','BT1-015']},{cards:['BT1-016']}]; O.trash=[]`);
await press('BT21-030', '登場時', '/重ねられている/'); await page.waitForTimeout(100);
o.pileCands = await ev(`fieldPickMode ? fieldPickMode.candidates.length : 'nopick'`); // 1枚だけのデジモンは候補外
await pickOpp(0); await page.waitForTimeout(200);
o.pile = await ev(`(() => { const O=practiceState.players[1-${pi}]; return O.battle.length+' trash='+O.trash.join(); })()`);
o.ok_pile = o.pileCands === 1 && o.pile === '1 trash=BT1-015,BT1-010,BT1-009';
// 2 お互い1ドロー
await setup(`P.battle=[{cards:['BT1-009','BT13-021']}]; P.hand=[]; O.hand=[]`);
await press('BT13-021', 'アタック時', '/お互いに1枚ドロー/'); await page.waitForTimeout(150);
o.draw = await ev(`practiceState.players[${pi}].hand.length+'/'+practiceState.players[1-${pi}].hand.length`);
o.ok_draw = o.draw === '1/1';
// 3 デスモン BT14-080: 自分のトラッシュ23枚 → 2×3=6枚
await setup(`P.battle=[{cards:['BT1-009','BT14-080']}]; P.trash=Array(23).fill('BT1-010'); O.trash=[]`);
const lib0 = await ev(`practiceState.players[1-${pi}].library.length`);
await press('BT14-080', '進化時', '/相手のデッキ/'); await page.waitForTimeout(150);
o.deck = lib0 - await ev(`practiceState.players[1-${pi}].library.length`);
o.ok_deck = o.deck === 6;
// 4 デュークモン BT2-020: 相手のトラッシュ20枚 → セキュリティ2枚
await setup(`P.battle=[{cards:['BT1-009','BT2-020']}]; O.trash=Array(20).fill('BT1-010')`);
const sec0 = await ev(`practiceState.players[1-${pi}].security.length`);
await press('BT2-020', 'アタック時', '/セキュリティ/'); await page.waitForTimeout(150);
o.sec = sec0 - await ev(`practiceState.players[1-${pi}].security.length`);
o.ok_sec = o.sec === 2;
// 5 EX2-043: お互い手札5枚に
await setup(`P.battle=[{cards:['BT1-009','EX2-043']}]; P.hand=Array(7).fill('BT1-010'); O.hand=Array(6).fill('BT1-015')`);
await press('EX2-043', '進化時', '/お互いの手札/'); await page.waitForTimeout(150);
for (let i = 0; i < 2; i++) { await page.evaluate(() => { document.querySelectorAll('#detailBody .cmp-row').forEach(r => r.click()); const b=[...document.querySelectorAll('#detailBody button')].find(x=>/破棄する/.test(x.textContent) && !x.disabled); b && b.click(); }); await page.waitForTimeout(200); }
o.hands = await ev(`practiceState.players[${pi}].hand.length+'/'+practiceState.players[1-${pi}].hand.length`);
o.ok_hands = o.hands === '5/5';
// 6 四大竜の試練(EX3-025 消滅時)
const trial = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='四大竜の試練').number`);
await setup(`P.battle=[]; P.hand=['${trial}']`);
await press('EX3-025', '消滅時', '/四大竜の試練/'); await page.waitForTimeout(150);
o.trial = await ev(`practiceState.players[${pi}].battle.map(st=>cardEntryNum(st.cards[0])).join()`);
o.ok_trial = o.trial === trial;
// 7 BT13-030: ロイヤルナイツ(このデジモン自身)1体+青のテイマー2体 → 3×2=進化元を上から6枚
const blueT = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='tamer' && c.color.length===1 && c.color[0]==='blue').number`);
await setup(`P.battle=[{cards:['BT1-009','BT13-030']},{cards:['${blueT}']},{cards:['${blueT}']}]; O.battle=[{cards:['BT1-009','BT1-010','BT1-014','BT1-013','BT1-012','BT1-011','BT1-020','BT1-015']}]; O.trash=[]`);
await press('BT13-030', '登場時', '/進化元/'); await page.waitForTimeout(150);
await pickOpp(0); await page.waitForTimeout(200);
o.per = await ev(`practiceState.players[1-${pi}].trash.length`);
o.ok_per = o.per === 6;
// 8 BT5-025: 下から2枚まで → 1枚を選ぶ
await setup(`P.battle=[{cards:['BT1-009','BT5-025']}]; O.battle=[{cards:['BT1-009','BT1-010','BT1-015']}]; O.trash=[]`);
await press('BT5-025', '進化時', '/進化元/'); await page.waitForTimeout(150);
await pickOpp(0); await page.waitForTimeout(150);
await page.evaluate(() => [...document.querySelectorAll('#attackBarActs button')].find(x => x.textContent.trim() === '1枚').click()); await page.waitForTimeout(150);
o.upto = await ev(`practiceState.players[1-${pi}].trash.join()`);
o.ok_upto = o.upto === 'BT1-009';

const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
