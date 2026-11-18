// 「デジモンが効果で登場/進化したとき」(BT25-058 カリスモン)は、普通の進化では出ず、効果で進化したときだけ出る
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const lv4 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===4 && c.color.length===1 && c.color[0]==='red' && !/【進化時】|とき/.test((c.effect||'')+(c.inherited||''))).number`);
const lv3 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===3 && c.color.length===1 && c.color[0]==='red' && !/とき|【/.test((c.effect||'')+(c.inherited||''))).number`);
const trial = async (effectName) => {
  await ev(`(() => { const P=practiceState.players[${pi}]; practiceState.memory=0; P.hand=['${lv4}']; P.battle=[{cards:['${lv3}']},{cards:['BT25-058']}]; clearEffectQueue(); practiceState.viewingIndex=${pi}; practiceState.turn.phase='main'; renderPracticeBoard(); })()`);
  await page.waitForTimeout(80);
  await ev(`(() => { enterEvolveMode(0, '${lv4}', false, {${effectName ? `effectName:'テスト', costRule:{type:'free'}` : ''}}); performEvolve(practiceState.players[${pi}].battle[0]); })()`);
  await page.waitForTimeout(150);
  await page.evaluate(() => { const b = document.querySelector('#evolveRouteModal.open .evolve-route-item:not(.eri-pay)'); b && b.click(); });
  await page.waitForTimeout(300);
  return ev(`(() => { const P=practiceState.players[${pi}]; const q=getEffectQueue(); return getStackTopCard(P.battle[0]).number+' '+[q.current,...q.pending].filter(e=>e && e.timing==='お互いのターン').map(e=>e.cardNumber).join(); })()`);
};
o.normal = await trial(false);
o.effect = await trial(true);
o.ok = o.normal === lv4 + ' ' && /BT25-058/.test(o.effect) && o.effect.startsWith(lv4);
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
