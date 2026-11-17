// アセンブリの最後の画面: 条件の枚数ちょうどなら 登場コスト-N、合わなければ登場コストのまま
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const run = async (mats) => {
  await ev(`(() => { const P=practiceState.players[${pi}]; practiceState.memory=${pi === 0 ? -10 : 10}; P.hand=['AD1-025']; P.trash=${JSON.stringify(mats)}; renderPracticeBoard(); })()`);
  await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=${pi}; practiceState.turn.phase='main'; renderPracticeBoard(); })()`);
  await ev(`enterAssemblyMode(0, 'AD1-025')`); await page.waitForTimeout(150);
  await page.evaluate(() => { document.querySelectorAll('#detailBody .cmp-row').forEach(r => r.click()); [...document.querySelectorAll('#detailBody button')].find(x => /この内容でOK/.test(x.textContent)).click(); });
  await page.waitForTimeout(200);
  const txt = await page.evaluate(() => document.getElementById('evolveRouteModal').innerText.replace(/\s+/g, ' '));
  await page.evaluate(() => document.querySelector('#evolveRouteModal.open .evolve-route-item').click());
  await page.waitForTimeout(200);
  return { txt, paid: (pi === 0 ? await ev('practiceState.memory') : -(await ev('practiceState.memory'))) + 10 };
};
const wg = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='ウォーグレイモン' && c.category==='digimon').number`);
const mg = await ev(`[...cardIndexByNumber.values()].find(c=>c.name==='メタルガルルモン' && c.category==='digimon').number`);
const two = await run([wg, mg]);
o.two = two.paid; o.twoTxt = /アセンブリ2枚\(-6\)/.test(two.txt);
const one = await run([wg]);
o.one = one.paid; o.oneTxt = /条件は2枚/.test(one.txt);
o.ok = o.two === 9 && o.twoTxt && o.one === 15 && o.oneTxt;
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ok']);
