// v0.97.3: セキュリティチェックの帯(効果パネルON: トラッシュへ+手で送る▾ / OFF: 3つ)
import { page, ev, errs, browser, bar, clickBar } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const opt = await ev(`[...cardIndexByNumber.values()].find(c => c.category==='option' && /【メイン】/.test(c.effect||'')).number`);
const start = () => ev(`(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; clearEffectQueue();
  P.battle=[{cards:['BT1-010']}]; O.battle=[]; O.security=['${opt}','BT1-010','BT1-019']; renderPracticeBoard();
  attackState = { attackerStack: P.battle[0], defenderOwner: O, securityChecksRemaining: 1 }; doSecurityCheckForAttack(); })()`);
await ev(`effectPanelEnabled || document.getElementById('effectPanelToggle').click()`);
await start(); await page.waitForTimeout(300);
o.on = await bar();
o.onOk = /トラッシュへ/.test(o.on) && /手で送る ▾/.test(o.on) && !/手札へ/.test(o.on);
await clickBar('手で送る'); await page.waitForTimeout(300);
o.open = await bar();
o.openOk = /手札へ/.test(o.open) && /バトルエリアに置く/.test(o.open) && /手で送る ▴/.test(o.open);
await ev(`clearEffectQueue(); renderEffectPanel();`);
await clickBar('バトルエリアに置く'); await page.waitForTimeout(400);
o.placed = await ev(`(() => { const O=practiceState.players[1-practiceState.turn.playerIndex]; const q=getEffectQueue(); return O.battle.some(s=>cardEntryNum(s.cards[0])==='${opt}') && !(q.current && /【メイン】/.test(q.current.text||'')); })()`);
// 効果パネルOFF: 3つ
await ev(`attackState = null; clearEffectQueue(); if (effectPanelEnabled) document.getElementById('effectPanelToggle').click();`);
await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/OFFのまま|OFFにする/.test(x.textContent)); b && b.click(); });
await start(); await page.waitForTimeout(300);
o.off = await bar();
o.offOk = /手札へ/.test(o.off) && /バトルエリア/.test(o.off) && !/手で送る/.test(o.off);
await ev(`attackState = null;`);
const ng = Object.entries(o).filter(([k, x]) => x === false).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
