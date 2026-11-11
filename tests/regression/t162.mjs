// v0.96.4: 1枚ずつ(Lv.4とLv.5)・アプ合体のボタン・手札をオープンして黄ならセキュリティへ・セキュリティのカードに進化
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const H = (num, line, idx) => `getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(practiceState.players[${pi}].battle[${idx||0}]), cardNumber:'${num}', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(line)}, timing:(/【([^】]+)】/.exec(${JSON.stringify(line)})||[])[1], event:'t'})`;
o.bt10027 = await ev(`(() => { practiceState.players[${pi}].battle=[{cards:['BT1-010']}]; return ${H('BT10-027','【アタック時】進化元を持たない相手のデジモンがいるとき、このデジモンの進化元から、Lv.3とLv.4のデジモンカード1枚ずつをコストを支払わずに登場できる。')}.map(h=>h.label); })()`);
// BT13-046: 手札の黄をセキュリティの上へ
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-010']}]; P.hand=['BT1-010','BT1-051']; P.security=['BT1-019']; renderPracticeBoard(); })()`);
await ev(`${H('BT13-046','【登場時】【進化時】お互いのセキュリティ合計が6枚以下なら、メモリー+3し、自分の手札を1枚オープンする。それが黄のカードなら、自分のセキュリティの上に裏向きで置く。黄のカード以外なら手札に戻す。')}.find(h=>/セキュリティの上へ/.test(h.label)).run()`);
await page.waitForTimeout(300);
o.secPickerOk = await page.evaluate(() => [...document.querySelectorAll('.cmp-row')].map(x=>x.innerText.replace(/\s+/g,' ')).join(' | '));
await page.evaluate(() => { [...document.querySelectorAll('.cmp-row')].find(x=>!/条件外/.test(x.innerText)).click(); });
await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/^置く/.test(x.textContent.trim()) && x.offsetParent); b && b.click(); });
await page.waitForTimeout(300);
o.secAfter = await ev(`[practiceState.players[${pi}].security.map(x=>JSON.stringify(x)), practiceState.players[${pi}].hand.map(cardEntryNum)]`);
// BT14-033 セキュリティに進化
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-046']}]; P.security=['BT1-019','BT1-051','BT1-010']; renderPracticeBoard(); })()`);
await ev(`${H('BT14-033','【自分のメインフェイズ開始時】自分のセキュリティを全て確認する。このデジモンをその中の黄のデジモンカードにコストを支払わずに進化できる。その後、自分のセキュリティをシャッフルする。')}.find(h=>/セキュリティのカードに進化/.test(h.label)).run()`);
await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector('.eep-row:not(.eep-ng) .eep-go').click());
await page.waitForTimeout(400);
await page.evaluate(() => { const b=[...document.querySelectorAll('#evolveRouteModal button')].find(x=>/の効果/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(400);
o.secEvolve = await ev(`[practiceState.players[${pi}].battle[0].cards.map(cardEntryNum), practiceState.players[${pi}].security.length]`);
// アプ合体ボタン: リンク状態のデジモンがいないとき
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-010']}]; })()`);
o.appNoLink = await ev(`${H('BT25-089','【自分のターン終了時】[ターン1回]自分のデジモン1体を手札のデジモンカードにアプ合体できる。')}.map(h=>h.label)`);

const nm = await ev(`(() => { const f=(pred)=>[...cardIndexByNumber.values()].find(pred); const lv=(l)=>f(c=>c.category==='digimon'&&c.level===l&&c.color.length===1&&c.color[0]==='yellow'&&/聖獣型/.test([c.type,c.form,c.attribute].join('/'))); const kuda=f(c=>c.name==='クダモン'&&c.category==='digimon'); return {l4:lv(4)&&lv(4).number, l5:lv(5)&&lv(5).number, l3:lv(3)&&lv(3).number, kuda:kuda.number}; })()`);

o.items = await ev(`expandEachConds('特徴「聖獣型」を持つ黄の、Lv.4とLv.5のデジモンカード')`);
o.assign = await ev(`[eachCondsAssignable([cardIndexByNumber.get('${nm.l4}'), cardIndexByNumber.get('${nm.l5}')], expandEachConds('特徴「聖獣型」を持つ黄の、Lv.4とLv.5のデジモンカード')), eachCondsAssignable([cardIndexByNumber.get('${nm.l4}'), cardIndexByNumber.get('${nm.l4}')], expandEachConds('特徴「聖獣型」を持つ黄の、Lv.4とLv.5のデジモンカード'))]`);
// コスト2/2の実行: テイマーの下3枚破棄済みとして
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['${nm.kuda}']},{cards:[{n:'BT1-010',d:true},{n:'BT1-010',d:true},{n:'BT1-010',d:true},'EX13-071']}]; P.trash=['${nm.l4}','${nm.l5}','${nm.l4}','BT1-010']; renderPracticeBoard(); })()`);
const costHs = await ev(`(() => { const P=practiceState.players[${pi}]; const c=cardIndexByNumber.get('EX13-071'); const l=c.effect.split('\\n').find(x=>/聖獣型/.test(x)); const e={ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[1]), cardNumber:'EX13-071', cardName:c.name, field:'effect', lineIndex:1, text:l, timing:'メイン', event:'t'}; window.__e=e; const hs=getEffectHandlers(e); hs.find(h=>/代償1\\/2/.test(h.label)).run(); return getEffectHandlers(e).map(h=>h.label); })()`);
o.costHs = costHs;
await page.waitForTimeout(300);
await ev(`getEffectHandlers(window.__e).find(h=>/代償2\\/2/.test(h.label)).run()`);
await page.waitForTimeout(300);
o.pickerSub = await page.evaluate(() => (document.querySelector('.cmp-sub, #cardMultiPicker .sub, .cmp-head') || {}).innerText || document.body.innerText.match(/条件:[^\n]*/)?.[0]);

const chk = {
  bt10027: o.bt10027.length === 1 && /2枚まで/.test(o.bt10027[0]),
  handToSec: o.secAfter[0][0] === '"BT1-051"' && !o.secAfter[1].includes('BT1-051'),
  secEvolve: o.secEvolve[0].length === 2 && o.secEvolve[1] === 2,
  appButton: o.appNoLink.some(x => /アプ合体/.test(x)),
  items: o.items.length === 2, assign: o.assign[0] === true && o.assign[1] === false,
  cost22: o.costHs.some(x => /代償2\/2: トラッシュから2枚/.test(x)),
};
const ng = Object.entries(chk).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(chk));
await browser.close(); console.log(ng.length ? ng : errs);
