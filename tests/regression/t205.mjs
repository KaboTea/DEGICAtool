// 「このデジモンは「【消滅時】…」の効果を得る」: カギかっこの中の効果は、今の効果のボタンにしない(与えるボタンだけ)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const pi = await ev('practiceState.turn.playerIndex');
const labels = await ev(`(() => { const P=practiceState.players[${pi}]; const st={cards:['BT1-009','EX8-012']}; P.battle=[st]; const tr=collectStackTriggers(st, ${pi}, 'battle', ['進化時'], {event:'t'})[0]; return effectHandlersWithConds(tr).handlers.map(h=>h.label); })()`);
const ok = labels.some(l => /ドロー/.test(l)) && labels.some(l => /効果を与える/.test(l)) && !labels.some(l => /トラッシュから登場/.test(l));
console.log(JSON.stringify(labels));
await browser.close(); console.log(ok ? errs : ['ng']);
