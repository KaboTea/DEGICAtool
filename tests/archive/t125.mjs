import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
console.log(await ev(`(() => { const p=${P(v)}; p.battle=[{cards:['BT1-010']},{cards:['BT1-030']}]; const e={ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'BT1-010', cardName:'T', text:'【メイン】他の自分のデジモン1体をこのデジモンの進化元の下に置くことで、≪1ドロー≫。'}; const r=effectHandlersWithConds(e); return JSON.stringify([extractEffectCosts(e.text), r.handlers.map(h=>h.label+(h.condNg?'[NG]':'')+(h.isCost?'[C]':'')), getEffectHandlers(Object.assign({},e,{text:'【メイン】'})).map(h=>h.label)]); })()`));
await browser.close(); console.log(errs);
