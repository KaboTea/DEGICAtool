// v0.98.2: 「青の自分のテイマーがいるとき、≪1ドロー≫」(ワニャモン BT11-002 の進化元効果)の「〜がいるとき」を条件として判定する
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const r = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT11-002','BT1-010']}];
  const blueT=[...cardIndexByNumber.values()].find(c=>c.category==='tamer' && (c.color||[]).includes('blue')).number;
  const c=cardIndexByNumber.get('BT11-002'); const e={ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT11-002', cardName:c.name, field:'inherited', lineIndex:0, text:c.inherited, timing:'アタック時', event:'アタック'};
  const ng=effectHandlersWithConds(e).handlers.find(h=>/ドロー/.test(h.label));
  P.battle.push({cards:[blueT]});
  const ok=effectHandlersWithConds(e).handlers.find(h=>/ドロー/.test(h.label));
  // 「〜したとき」(誘発)は条件として読まない
  const trig=extractEffectConditions('【自分のターン】自分のデジモンが登場したとき、≪1ドロー≫。', P.battle[0], pi, {entry:e});
  return { noTamer: !!ng && !!ng.condNg, withTamer: !!ok && !ok.condNg, trigger: trig.length === 0 }; })()`);
Object.assign(o, r);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
