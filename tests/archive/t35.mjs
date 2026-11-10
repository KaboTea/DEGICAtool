import { page, ev, errs, browser, bar, clickBar, banner } from '../head.mjs';
const w = (ms=400) => page.waitForTimeout(ms);
const TAG = process.env.TAG || 'pc';
const me='practiceState.players[practiceState.viewingIndex]', op='practiceState.players[1-practiceState.viewingIndex]';
const layout = () => page.evaluate(() => {
  const items = [];
  const b = document.getElementById('attackBar'), e = document.getElementById('effectPanel'), m = document.getElementById('attackMini');
  if (!b.hidden && !b.classList.contains('fx-collapsed')) items.push([+getComputedStyle(b).order, 'BAR[' + b.dataset.kind + '] ' + document.getElementById('attackBarHead').innerText.replace(/\s+/g,' ').slice(0,40)]);
  if (!e.hidden) items.push([+getComputedStyle(e).order, (e.classList.contains('fx-collapsed') ? 'EFF(mini) ' : 'EFF ') + (e.querySelector('.ep-head')||{}).innerText?.replace(/\s+/g,' ').slice(0,40)]);
  if (!m.hidden) items.push([+getComputedStyle(m).order, 'ATKMINI ' + m.innerText.replace(/\s+/g,' ')]);
  return items.sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join('  ||  ');
});
await ev(`(() => { practiceState.turn.phase='main'; ${me}.battle=[{cards:['BT1-010','BT17-036'],rested:false,enteredTurn:-5},{cards:['BT11-037'],rested:false,enteredTurn:-5}]; ${op}.battle=[{cards:['BT1-010','BT2-019'],rested:true}]; ${op}.security[0]='BT1-096'; clearEffectQueue(); renderPracticeBoard(); renderEffectPanel(); })()`); await w();
// 1 attack only
await ev(`declareAttack(${me}.battle[0])`); await w();
await page.click('#fieldPickBtns button:has-text("相手プレイヤーへ")'); await w();
console.log('1 attack step:', await layout());
// 2 add effect pending during attack
await ev(`(() => { enqueueEffects([], [{ownerIndex: practiceState.viewingIndex, stackUid: ensureStackUid(${me}.battle[1]), cardNumber:'BT11-037', cardName:'コテモン', field:'effect', lineIndex:0, text:'【アタック時】相手のデジモン1体をDP-3000。', timing:'アタック時', event:'t'}]); renderEffectPanel(); })()`); await w();
console.log('2 +effect:', await layout());
await page.screenshot({path:`fx_${TAG}_2.png`});
// 3 destroy confirm on top
await ev(`resolveDestructionQueue([${op}.battle[0]], () => { resumeAttackStepIfAny(); })`); await w();
console.log('3 +destroy:', await layout());
await page.screenshot({path:`fx_${TAG}_3.png`});
// peek effect while destroy open
await page.evaluate(() => document.querySelector('#effectPanel .ep-head').click()); await w();
console.log('3b peek effect:', await layout());
// resolve destroy
await clickBar('そのまま消滅'); await w(600);
console.log('4 after destroy:', await layout());
// peek attack
await page.evaluate(() => document.getElementById('attackMini').click()); await w();
console.log('4b peek attack:', await layout());
// finish effect
await ev('finishCurrentEffect(false); renderEffectPanel();'); await w(600);
console.log('5 effect done:', await layout());
await page.screenshot({path:`fx_${TAG}_5.png`});
// security check stage
for (let i=0;i<8;i++) { const bn = await banner(); if (bn!=='(no banner)') { await page.click('#fieldPickBtns button:has-text("ブロックしない")').catch(()=>{}); await w(); continue; } const b = await bar(); if (/^🛡 セキュリティチェック/.test(b)) break; await ev('clearEffectQueue(); renderEffectPanel();'); await clickBar('次へ').catch(()=>{}); await w(); }
console.log('6 security:', await layout());
await page.screenshot({path:`fx_${TAG}_6.png`});
console.log('palette', await page.evaluate(() => getComputedStyle(document.getElementById('practiceBoardPanel')).getPropertyValue('--self-rgb') + ' / ' + getComputedStyle(document.getElementById('practiceBoardPanel')).getPropertyValue('--opp-rgb')));
await browser.close(); console.log('errs', errs);
