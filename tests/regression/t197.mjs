// 進化条件の「特徴」は、特徴の欄だけでなく形態(ハイブリッド体・アプモン)・属性(フリー)の欄も見る
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const chk = (evoNum, topNum, st) => ev(`(() => { const card=cardIndexByNumber.get('${evoNum}'), top=cardIndexByNumber.get('${topNum}'); const r=buildEvolveRoutes(card, top).find(x=>x.sub && /特徴/.test(x.sub)); return evaluateSpecialCondition(r.sub, top, ${st || `{cards:['${topNum}']}`}); })()`);
o.hybridColorLv4 = await chk('BT18-026', 'BT12-012');           // 赤のハイブリッド体Lv.4 → 青/赤
o.hybridWrongColor = (await chk('BT18-070', 'BT12-012')) === false; // 赤 → 黒/黄 は不可
o.freeLv4 = await chk('AD1-011', 'BT10-074');                    // 属性「フリー」
o.freeLv6 = await chk('EX13-076', 'AD1-024');
o.hybridLv6 = await chk('EX12-076', 'BT12-017');
o.appmonLv2 = await ev(`(() => { const top=[...cardIndexByNumber.values()].find(c=>c.level===2 && /アプモン/.test(c.form||'')); if (!top) return 'none'; const card=cardIndexByNumber.get('BT21-041'); const r=buildEvolveRoutes(card, top).find(x=>x.sub && /アプモン/.test(x.sub)); return evaluateSpecialCondition(r.sub, top, {cards:[top.number]}); })()`);
o.under2 = await ev(`(() => { const all=[...cardIndexByNumber.values()]; const tam=all.find(c=>c.name==='神原拓也' && c.category==='tamer'); const hy=all.filter(c=>/ハイブリッド体/.test(c.form||'')).slice(0,2).map(c=>c.number);
  const r=buildEvolveRoutes(cardIndexByNumber.get('AD1-002'), tam).find(x=>/下に/.test(x.sub||'')); return evaluateSpecialCondition(r.sub, tam, {cards:[...hy, tam.number]}) === true && evaluateSpecialCondition(r.sub, tam, {cards:[hy[0], tam.number]}) === false; })()`);
const ng = Object.entries(o).filter(([, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
