// v0.98.0: スマホの縦画面(pt-mode): 横画面の仕組みのまま縦に並べる。1画面に収まり、手札と場が重ならない
import { page, ev, errs, browser } from '../head.mjs';
await page.setViewportSize({ width: 390, height: 660 });
await page.waitForTimeout(800);
const o = {};
await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; const O=practiceState.players[1-practiceState.viewingIndex];
  P.battle=[{cards:['BT1-010','BT1-009']},{cards:['BT2-112']},{cards:['BT1-085']},{cards:['BT1-096']}]; O.battle=[{cards:['BT10-030']},{cards:['BT14-084']}];
  P.hand=['BT1-009','BT4-019','ST1-03']; renderPracticeBoard(); clearEffectQueue(); renderEffectPanel(); renderPracticeBoard(); })()`);
await page.waitForTimeout(500);
o.mode = await ev(`document.body.classList.contains('pt-mode') && document.body.classList.contains('ls-mode')`);
o.fit = await ev(`(() => { const r=(s)=>document.querySelector(s).getBoundingClientRect(); const b=r('#selfMatBlock #selfBattleArea'), h=r('#selfHandRow'), sb=r('#selfMatBlock'); return b.bottom <= h.top + 2 && h.bottom <= sb.bottom + 2 && sb.bottom <= innerHeight + 1; })()`);
o.header = await ev(`getComputedStyle(document.querySelector('body > header')).display !== 'none' && getComputedStyle(document.querySelector('nav.tabs')).display !== 'none'`);
o.lanes = await ev(`(() => { const t=document.querySelector('#selfBattleArea .battle-top-group').getBoundingClientRect(), b=document.querySelector('#selfBattleArea .battle-bottom-group').getBoundingClientRect(); return t.bottom <= b.top + 1; })()`);
// 2回目のタップの要約パネルは画面の下に横長
const tile = async () => (await page.$$('#selfBattleArea .stack-tile'))[0];
await (await tile()).click({ force: true }); await page.waitForTimeout(250);
o.bubble = await ev(`!!document.getElementById('lsFieldBar')`);
await (await tile()).click({ force: true }); await page.waitForTimeout(300);
o.sum = await ev(`(() => { const p=document.getElementById('lsSumPanel'); if(!p) return 'none'; const r=p.getBoundingClientRect(); return r.width > innerWidth - 20 && Math.abs(r.bottom - innerHeight) < 20; })()`);
// 進化先を選ぶ案内は、画面の上に横長(キャンセルは✕)
await ev(`(() => { lsSummary = null; lsRenderOverlay(); enterEvolveMode(1, practiceState.players[practiceState.viewingIndex].hand[1], false); })()`); await page.waitForTimeout(300);
o.evoBanner = await ev(`(() => { const r=document.querySelector('.evolve-mode-banner.active').getBoundingClientRect(); return r.width > innerWidth - 20 && r.height < 80; })()`);
await ev(`document.getElementById('evolveModeCancel').click()`); await page.waitForTimeout(200);
// 横画面・PCでは縦画面用にならない
await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(500);
o.landscape = await ev(`document.body.classList.contains('ls-mode') && !document.body.classList.contains('pt-mode')`);
await page.setViewportSize({ width: 1280, height: 800 }); await page.waitForTimeout(500);
o.pc = await ev(`!document.body.classList.contains('ls-mode') && !document.body.classList.contains('pt-mode')`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
