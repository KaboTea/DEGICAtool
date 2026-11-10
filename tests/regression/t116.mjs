import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
console.log(await ev(`(() => { const p=${P(v)}; p.battle=[{cards:['BT21-005','BT21-018','BT21-047','BT21-073','BT21-073'],rested:false, links:['BT21-009']}]; renderPracticeBoard(); const st=p.battle[0]; return JSON.stringify([getStackEffectSources(st).map(s=>s.field+':'+s.card.name), getEffectiveDP(st), stackHasLinkedKeyword(st,'貫通'), stackHasLinkedKeyword(st,'突進'), cardHasLinkEffect(cardIndexByNumber.get('BT21-005')), cardHasLinkEffect(cardIndexByNumber.get('BT21-009'))]); })()`));
await browser.close(); console.log(errs);
