import { page, ev, errs, browser } from '../head.mjs';
const W = process.env.W || '1280';
await ev(`(() => { const me=practiceState.players[practiceState.viewingIndex], op=practiceState.players[1-practiceState.viewingIndex];
 practiceState.fieldEffects=[{kind:'restrict',restrict:'noOption',target:'opponent',ownerIndex:practiceState.viewingIndex,duration:'untilNextOpponentTurnEnd',expireAtTurnCount:practiceState.turn.count+1,refCardName:'プログラム緊急停止!'},{ownerIndex:practiceState.viewingIndex,target:'own',amount:1000,duration:'thisTurn',expireAtTurnCount:practiceState.turn.count}];
 me.battle=[{cards:['BT1-010','BT2-019'],rested:false}]; op.battle=[{cards:['BT1-010','BT12-112'],rested:false}]; practiceState.turn.playerIndex = 1-practiceState.viewingIndex; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`);
await page.waitForTimeout(2500);
if (process.env.H) await page.evaluate(() => { const b=[...document.querySelectorAll('#lsDock button')].find(x=>/たたむ/.test(x.textContent)); if (b) b.click(); });
await page.waitForTimeout(400);
await page.evaluate(() => window.scrollTo(0,0));
await (process.env.H ? page : await page.$('#practiceBoardPanel')).screenshot({path:`impl_${W}${process.env.H||''}.png`});
if (!process.env.H && W==='1280') { await page.click('.rx-chip'); await page.waitForTimeout(300); await (await page.$('#fieldEffectsModal .modal')).screenshot({path:'impl_modal.png'}); }
await browser.close(); console.log(errs);
