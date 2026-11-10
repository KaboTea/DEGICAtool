import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=250) => page.waitForTimeout(ms);
const me = 'practiceState.players[practiceState.viewingIndex]', op = 'practiceState.players[1-practiceState.viewingIndex]';
const chips = () => page.evaluate(() => [...document.querySelectorAll('.rx-chip')].map(c => c.closest('.mat-block,.mat-label,body') && (c.parentElement.previousElementSibling||{}).id + ':' + c.textContent + (c.classList.contains('auto')?'(auto)':'')).join(' | ') + ' || btn=' + document.getElementById('fieldEffectsBtn').textContent);
// 1 parse
console.log('parse', JSON.stringify(await ev(`['EX1-072','BT1-100','EX3-073','BT8-057','BT12-112'].map(n => { const c=cardIndexByNumber.get(n); return n + ':' + [c.effect,c.security_effect].filter(Boolean).join(String.fromCharCode(10)).split(String.fromCharCode(10)).flatMap(l=>parsePlayerRestrictions(l)).map(r=>r.restrict+'/'+r.side+'/'+r.duration+(r.optionOnly?'/opt':'')+(r.cond?'/'+r.cond:'')).join(','); })`)));
// 2 effect panel button -> chip
await ev(`(() => { ${me}.battle=[]; ${op}.battle=[]; practiceState.fieldEffects=[]; renderPracticeBoard(); })()`);
await enq('【メイン】次の相手のターン終了時まで、相手はオプションカードを使用できない。'); console.log('btns', await autoBtns());
await clickAuto('オプション使用不可'); await w(); console.log('chips', await chips());
// 3 option use by opponent: switch view
await ev(`(() => { practiceState.viewingIndex = 1 - practiceState.viewingIndex; ${me}.hand = ['BT1-090']; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
console.log('chips(view opp)', await chips());
await ev(`appearFromHand(0, 'BT1-090', {clientX:100, clientY:100})`); await w(); console.log('opt bar', await bar());
await clickBar('やめる'); await w(); console.log('hand after cancel', await ev(`${me}.hand.length`));
await ev(`practiceState.viewingIndex = 1 - practiceState.viewingIndex; renderPracticeBoard();`);
// 4 static: BT12-112 on my field during my turn -> opp security option effects blocked
await ev(`(() => { practiceState.fieldEffects=[]; ${me}.battle=[{cards:['BT12-112'],rested:false,enteredTurn:-5}]; ${op}.battle=[]; ${op}.security[0]='BT1-096'; clearEffectQueue(); renderPracticeBoard(); })()`); await w();
console.log('static chips', await chips());
await ev(`declareAttack(${me}.battle[0])`); await w();
await page.click('#fieldPickBtns button:has-text("相手プレイヤーへ")'); await w();
for (let i=0;i<10;i++) { console.log('  step', (await bar()).slice(0,50), '|', (await banner()).slice(0,30)); const bn = await banner(); if (bn!=='(no banner)') { await page.click('#fieldPickBtns button:has-text("ブロックしない")').catch(()=>{}); await w(); continue; } const b = await bar(); if (/^🛡 セキュリティチェック/.test(b)) break; await ev('clearEffectQueue(); renderEffectPanel();'); await clickBar('次へ').catch(()=>{}); await w(); }
console.log('sec bar', await bar()); console.log('queue', await ev(`(practiceState.effectQueue.current||{}).cardName + '/' + practiceState.effectQueue.pending.length`));
await clickBar('それでも'); await w(); console.log('forced queue', await ev(`(practiceState.effectQueue.current||{}).cardName + '/' + practiceState.effectQueue.pending.map(e=>e.cardName).join(',')`), '|', (await bar()).slice(0,80));
await ev('cancelAttackRevertToBeforeAttack()'); await w();
// 5 attacker self static: BT1-025 checks option
await ev(`(() => { ${me}.battle=[{cards:['BT1-010','BT1-025'],rested:false,enteredTurn:-5}]; ${op}.security[0]='BT1-096'; clearEffectQueue(); renderPracticeBoard(); })()`);
console.log('BT1-025 reason', await ev(`securityEffectBlockReason(cardIndexByNumber.get('BT1-096'), ${me}.battle[0], 1-practiceState.viewingIndex)`), '/ digimon:', await ev(`securityEffectBlockReason(cardIndexByNumber.get('BT1-010'), ${me}.battle[0], 1-practiceState.viewingIndex)`));
// 6 noAttackNoMat
await ev(`(() => { practiceState.fieldEffects=[{kind:'restrict',restrict:'noAttackNoMat',target:'opponent',ownerIndex:1-practiceState.viewingIndex,duration:'thisTurn',expireAtTurnCount:practiceState.turn.count,refCardName:'グレイスクロスフリーザー'}]; ${me}.battle=[{cards:['BT1-010'],rested:false,enteredTurn:-5},{cards:['BT1-010','BT2-019'],rested:false,enteredTurn:-5}]; renderPracticeBoard(); })()`);
await ev(`declareAttack(${me}.battle[0])`); await w(); console.log('nomat bar', await bar()); await clickBar('やめる'); await w(); console.log('attack?', await ev('!!attackState'));
await ev(`declareAttack(${me}.battle[1])`); await w(); console.log('with mat banner', (await banner()).slice(0,40)); await ev('cancelAttackRevertToBeforeAttack()');
// 7 DP field effect still works + list
await ev(`(() => { practiceState.fieldEffects.push({ownerIndex:practiceState.viewingIndex,target:'own',amount:1000,duration:'thisTurn',expireAtTurnCount:practiceState.turn.count}); ${me}.battle=[{cards:['BT1-010'],rested:false}, {cards:['BT14-009'],rested:false}]; renderPracticeBoard(); })()`);
console.log('DP', await ev(`getEffectiveDP(${me}.battle[0])`), 'chips', await chips());
await page.click('#fieldEffectsBtn'); await w();
console.log('list', await page.evaluate(() => document.getElementById('fieldEffectsList').innerText.replace(/\n+/g,' / ')));
await page.screenshot({path:'fe_list.png'});
await browser.close(); console.log('errs', errs);
