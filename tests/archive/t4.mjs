import { page, ev, errs, browser, banner, bar, clickBar } from '../head.mjs';
const w = (ms=300) => page.waitForTimeout(ms);
// attack regression
const r = await ev(`(() => { practiceState.turn.phase='main'; const me=practiceState.players[practiceState.viewingIndex]; const op=practiceState.players[1-practiceState.viewingIndex];
  me.battle=[{cards:['BT1-010'],rested:false,enteredTurn:-5}]; op.battle=[]; clearEffectQueue(); renderPracticeBoard(); declareAttack(me.battle[0]); return op.security.length; })()`);
await w(); console.log('sec before', r, '|', await banner());
await page.click('text=相手プレイヤーへ'); await w();
for (let i=0;i<8;i++) { const b = await bar(); if (b==='(no bar)') break; const bn = await banner(); if (bn!=='(no banner)') { console.log(' banner:', bn.slice(0,60)); await page.click('#fieldPickBtns button:has-text("ブロックしない")'); await w(); continue; } console.log(' step:', b.slice(0,70), 'sec=', await ev(`practiceState.players[1-practiceState.turn.playerIndex].security.length + '/trash=' + practiceState.players[1-practiceState.turn.playerIndex].trash.length + ' view=' + practiceState.viewingIndex`)); const btn = /行き先/.test(b) ? 'トラッシュへ' : (/次へ/.test(b) ? '次へ' : (/ブロックしない/.test(b)?'ブロックしない':'そのまま'));
  await ev('clearEffectQueue(); renderEffectPanel();');
  await clickBar(btn); await w(); }
console.log('after attack', await ev(`practiceState.players[1-practiceState.viewingIndex].security.length + ' attack=' + !!attackState`));
// guardian on bounce
const ids = await ev(`(() => { const op=practiceState.players[1-practiceState.viewingIndex]; op.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-010'],rested:false,guardianOverride:true}]; renderPracticeBoard(); return op.battle.map(getFxId); })()`);
await ev(`removeCardFromStackAt(practiceState.players[1-practiceState.viewingIndex].battle[0], 0, 'hand')`); await w();
console.log('guardian bar', (await bar()).slice(0,140));
await clickBar('守護'); await w(); console.log('guardian after', await ev(`practiceState.players[1-practiceState.viewingIndex].battle.length + ' hand=' + practiceState.players[1-practiceState.viewingIndex].hand.length`), await bar());
await browser.close(); console.log('errs', errs);
