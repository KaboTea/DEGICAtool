// v0.97.6: 「このデジモンと相手のデジモン1体でバトルできる」等、効果でバトルする
import { page, ev, errs, browser, bar } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const H = (num, re) => `(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const c=cardIndexByNumber.get('${num}');
  const line=c.effect.split('\\n').find(l=>${re}.test(l)); return getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'x', event:'t'}); })()`;
const small = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.dp===2000).number`);
await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi]; clearEffectQueue(); P.battle=[{cards:['BT25-057']}]; O.battle=[{cards:['${small}']}]; renderPracticeBoard(); })()`);
await ev(`${H('BT25-057', '/でバトルできる/')}.find(h=>/🥊/.test(h.label)).run()`);
await page.waitForTimeout(200);
o.pick = await ev(`!!fieldPickMode && fieldPickMode.candidates.length === 1`);
await ev(`(() => { fieldPickMode.selected=[fieldPickMode.candidates[0]]; finishFieldPick(); })()`);
await page.waitForTimeout(300);
o.result = /勝利/.test(await bar());
// 条件つきの自分のデジモン(EX13-044)
o.condLabel = await ev(`${H('EX13-044', '/でバトルできる/')}.some(h=>/「ドラコモン」\\/「エグザモン」の記述がある/.test(h.label))`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
