import { page, ev, errs, browser } from '../head.mjs';
const me='practiceState.players[practiceState.viewingIndex]';
const eater = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /イーター/.test(c.type||'') && c.play_cost>=3)?.number`);
console.log(eater);
await ev(`(() => { practiceState.turn.phase='main'; ${me}.hand=['${eater}']; renderPracticeBoard(); })()`);
try { await ev(`appearFromHand(0, '${eater}')`); } catch(e) { console.log('ERR', e.message.slice(0,400)); }
await browser.close(); console.log(errs);
