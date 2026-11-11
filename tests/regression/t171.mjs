// v0.96.13: 横画面の一覧シート(2列・ボタン3つ以上は2段)・通知を上に・「残りはデッキの上か下」は片側に決めたら残りも同じ側
import { page, ev, errs, browser } from '../head.mjs';
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(1500);
const o = {};
const text = '【メイン】自分のデッキの上から3枚オープンする。その中の特徴に「デーヴァ」/「四聖獣」を持つカード1枚を自分のデジモン1体の進化元の下に置くか、手札に加える。残りはデッキの上か下だけに戻す。';
await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; practiceState.turn.phase='main';
  const deva=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /デーヴァ/.test((c.traits||c.type||'')+''+JSON.stringify(c))).number;
  P.library=[deva,'BT1-010','BT1-019',...P.library]; P.battle=[{cards:['BT1-010']}]; renderPracticeBoard();
  revealTopAndSort(3, ${JSON.stringify(text)}, 'テスト'); })()`);
await page.waitForTimeout(400);
const rowInfo = () => page.evaluate(() => [...document.querySelectorAll('.rg-row')].map(r => [...r.querySelectorAll('button')].map(b => b.textContent.trim())));
o.before = await rowInfo();
o.hasBoth = o.before.every(r => r.some(t => /山札上/.test(t)) && r.some(t => /山札下/.test(t)));
o.twoCols = await page.evaluate(() => getComputedStyle(document.querySelector('.rg-list')).gridTemplateColumns.split(' ').length === 2);
o.btnGrid = await page.evaluate(() => getComputedStyle(document.querySelector('.rg-row > div:last-child')).display === 'grid');
o.sheet = await page.evaluate(() => getComputedStyle(document.querySelector('#cardDetailModal .modal')).borderTopColor !== 'rgba(0, 0, 0, 0)');
// 合わないカードを山札上へ → 残りは上だけ
await page.evaluate(() => { const r = [...document.querySelectorAll('.rg-row')].find(r => r.querySelector('.rg-step[disabled]')); [...r.querySelectorAll('.rg-rest')].find(b => /山札上/.test(b.textContent)).click(); });
await page.waitForTimeout(300);
o.after = await rowInfo();
o.onlyTop = o.after.every(r => r.some(t => /山札上/.test(t)) && !r.some(t => /山札下/.test(t)));
o.bulkTop = await page.evaluate(() => [...document.querySelectorAll('.rg-bulk')].map(b => b.textContent).join('|')).then(t => /上/.test(t) && !/下/.test(t));
o.guide = await page.evaluate(() => /上に決まりました/.test(document.getElementById('detailBody').textContent));
// 通知は画面の上に出る
await ev(`showToast('テスト通知')`); await page.waitForTimeout(400);
o.toastTop = await page.evaluate(() => document.querySelector('.toast').getBoundingClientRect().top < 60);
const ng = Object.entries(o).filter(([k, x]) => x !== true && typeof x === 'boolean').map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
