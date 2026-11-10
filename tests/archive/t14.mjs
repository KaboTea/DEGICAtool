import { page, ev, errs, browser, banner, bar, clickBar, enq, autoBtns, clickAuto } from '../head.mjs';
const w = (ms=250) => page.waitForTimeout(ms);
const me = 'practiceState.players[practiceState.viewingIndex]';
const st = () => ev(`(() => { const p=${me}; return 'field=' + p.battle.map(s=>s.cards.map(miniCardName).join('>')).join(' | ') + ' hand=' + p.hand.length + ' trash=' + p.trash.map(miniCardName).join(',') + ' mem=' + practiceState.memory; })()`);
const modal = () => page.evaluate(() => { const m=document.getElementById('evolveRouteModal'); if (!m.classList.contains('open')) return '(closed)'; return document.getElementById('evolveRouteSubtitle').textContent + ' || ' + [...document.querySelectorAll('#evolveRouteList .evolve-route-item')].map(b=>b.innerText.replace(/\s+/g,' ')).join(' / ') + ' || manual=' + document.getElementById('evolveManualCost').value; });
const enqFrom = (text, uid) => ev(`(() => { clearEffectQueue(); enqueueEffects([], [{ownerIndex: practiceState.viewingIndex, stackUid: ${uid}, cardNumber:'BT9-071', cardName:'テスト', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'アタック時', event:'t'}]); renderEffectPanel(); })()`);
await ev(`practiceState.turn.phase='main'`);
// 1 trash 🧬進化
await ev(`(() => { const p=${me}; p.battle=[{cards:['BT1-010'],rested:false}]; p.trash=['AD1-001','BT1-090']; p.hand=[]; renderPracticeBoard(); })()`);
await page.click('#practiceBoardPanel .trash-zone, #selfTrash, [id*=Trash]').catch(()=>{});
await ev('openTrashListView()'); await w();
console.log('1 trash btns', await page.$$eval('.trash-row-evolve', b=>b.length));
await page.click('.trash-row-evolve'); await w(); console.log('1 banner', await page.evaluate(()=>document.getElementById('evolveModeText').textContent));
const fid = await ev(`getFxId(${me}.battle[0])`);
await page.click(`[data-fxid="${fid}"]`); await w(); console.log('1 modal', await modal());
await page.click('#evolveRouteList .evolve-route-item'); await w(); console.log('1 after', await st());
// 2 self, trash, normal (BT9-071)
await ev(`(() => { const p=${me}; p.battle=[{cards:['BT1-010'],rested:false}]; p.trash=['BT1-023','AD1-001']; renderPracticeBoard(); })()`);
let uid = await ev(`JSON.stringify(ensureStackUid(${me}.battle[0]))`);
await enqFrom('【アタック時】このデジモンを、自分のトラッシュの特徴に「アンデッド型」か「魔獣型」を持つデジモンカード1枚に進化コストを支払って進化できる。', uid);
console.log('2 btns', await autoBtns()); await clickAuto('トラッシュから進化'); await w(); console.log('2 bar', await bar(), '| modal', await modal());
await page.evaluate(()=>{const b=document.getElementById('evolveRouteCancel'); if (b.offsetParent) b.click();}); await w(); await ev('exitEvolveMode(); attackBarState=null; renderAttackBar(); renderPracticeBoard();');
// 3 minus from hand, self (AD1-011 style)
await ev(`(() => { const p=${me}; p.battle=[{cards:['BT1-010','AD1-001'],rested:false}]; p.hand=['AD1-024','BT1-023']; p.trash=[]; renderPracticeBoard(); })()`);
uid = await ev(`JSON.stringify(ensureStackUid(${me}.battle[0]))`);
await enqFrom('【アタック時】このデジモンを手札の名称に「スカルグレイモン」を含むデジモンカードに支払う進化コスト-2で進化できる。', uid);
console.log('3 btns', await autoBtns()); await clickAuto('手札から進化'); await w(); console.log('3 bar', await bar()); await clickBar('スカルグレイモン'); await w(); console.log('3 modal', await modal());
await page.click('#evolveRouteList .evolve-route-item'); await w(); console.log('3 after', await st());
// 4 free+ignore, pick
await ev(`(() => { const p=${me}; p.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-010','AD1-001'],rested:false}]; p.hand=['AD1-024']; renderPracticeBoard(); })()`);
await enqFrom('【メイン】自分の「アグモン」1体を手札の「インペリアルドラモン:ファイターモード」に進化条件を無視してコストを支払わずに進化できる。', 'null');
console.log('4 btns', await autoBtns()); await clickAuto('手札から進化'); await w(); console.log('4 bar', await bar());
console.log('4 targets', await page.$$eval('#practiceBoardPanel .stack-tile.evolve-target, #practiceBoardPanel .stack-tile.target', e=>e.length), await page.evaluate(()=>document.getElementById('evolveModeText').textContent));
const ids = await ev(`${me}.battle.map(getFxId)`);
await page.click(`[data-fxid="${ids[0]}"]`); await w(); console.log('4 modal', await modal());
await page.click('#evolveRouteList .evolve-route-item'); await w(); console.log('4 after', await st());
// 5 jogress
await ev(`(() => { const p=${me}; p.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-010'],rested:false}]; p.hand=['AD1-024']; renderPracticeBoard(); })()`);
await enqFrom('【自分のターン終了時】このデジモンと他の自分のデジモンで、手札のデジモンカードにジョグレス進化できる。', 'null');
console.log('5 btns', await autoBtns()); await clickAuto('ジョグレス'); await w(); console.log('5 bar', (await bar()).slice(0,120));
await browser.close(); console.log('errs', errs);
