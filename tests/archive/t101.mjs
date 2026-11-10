import { page, ev, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT1-019','EX6-023'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
for (const n of ['EX6-023','BT18-017','BT12-031','BT11-111','BT18-102','P-146','EX3-073']) {
  console.log(n, await ev(`(() => { const st=${P(v)}.battle[0]; const c=cardIndexByNumber.get('${n}'); return [c.effect,c.inherited].filter(Boolean).join('\\n').split('\\n').filter(l=>/進化元から|進化元の/.test(l)).map(l=>JSON.stringify(effectHandlersWithConds({ownerIndex:${v}, stackUid: ensureStackUid(st), text:l, cardName:'x', cardNumber:'${n}', field:'effect'}).handlers.map(h=>h.label))).join(' | '); })()`));
}
await browser.close();
