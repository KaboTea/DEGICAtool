// v0.96.14: 公開したカードの置き先の読み取り(「自分のデジモン1体の」が重複しない・「このテイマーの下」はそのテイマーだけ・「自分の「X」1体の進化元の1番下」)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const ph = (t) => ev(`parseRevealInstructions(${JSON.stringify(t)}).steps.map(revealDestPhrase).join('|')`);
o.ex5 = (await ph('【メイン】自分のデッキの上から3枚オープンする。その中の特徴に「デーヴァ」/「四聖獣」を持つカード1枚を自分のデジモン1体の進化元の下に置くか、手札に加える。残りはデッキの上か下だけに戻す。')) === '自分のデジモン1体の進化元の下に置く';
o.taiki = (await ph('【登場時】自分のデッキの上から4枚オープンする。その中の特徴に「クロスハート」を持つカード1枚を手札に加え、特徴に「クロスハート」を持つデジモンカード1枚をこのテイマーの下に置く。残りは好きな順番でデッキの下に戻す。')).endsWith('このテイマーの下に置く');
o.mother = (await ph('【メイン】このデジモンをレストさせることで、自分のデッキの上から5枚オープンする。その中の「ADR-02=サーチャー」1枚を自分の「マザー デ・リーパー」1体の進化元の1番下に置く。残ったカードは好きな順番でデッキの下に戻す。')) === '自分の「マザー デ・リーパー」の進化元の下に置く';
o.saviors = (await ph('【登場時】自分のデッキの上から3枚オープンする。その中のデジモンカード1枚を特徴「セイバーズ」を持つ自分のテイマーの下に裏向きで置く。残りはデッキの下に戻す。')) === '特徴「セイバーズ」を持つ自分のテイマーの下に裏向きで置く';
// 「このテイマーの下」: 効果を持つテイマーだけが置き先になる
const text = '【登場時】自分のデッキの上から4枚オープンする。その中の特徴に「クロスハート」を持つカード1枚を手札に加え、特徴に「クロスハート」を持つデジモンカード1枚をこのテイマーの下に置く。残りは好きな順番でデッキの下に戻す。';
const r = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; practiceState.turn.phase='main';
  const xh=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /クロスハート/.test(JSON.stringify(c))).number;
  P.battle=[{cards:['BT10-087']},{cards:['BT10-087']}]; P.library=[xh,...P.library]; renderPracticeBoard();
  const uid=ensureStackUid(P.battle[1]); revealTopAndSort(1, ${JSON.stringify(text)}, '工藤タイキ', uid);
  const b=[...document.querySelectorAll('.rg-step')].find(b=>/テイマー下/.test(b.textContent)&&!b.disabled); if(!b) return 'nobtn'; b.click(); return 'ok'; })()`);
await page.waitForTimeout(300);
o.clicked = r === 'ok';
o.onlyThis = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const c=fieldPickMode && fieldPickMode.candidates; return !!c && c.length===1 && c[0]===P.battle[1]; })()`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
