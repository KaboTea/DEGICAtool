// 誘発条件5つ(2026-11-22): 手札が効果で増えた / 手札が破棄された / テイマーの下のカードが効果で破棄された / 進化元が効果で増えた / バトルエリアを離れた
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(80); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=${pi}; renderPracticeBoard(); })()`); await page.waitForTimeout(40); };
const setup = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; ${js}; renderPracticeBoard(); })()`); await settle(); };
// 効果を処理している最中にする(キューに仮の効果を1つ置く)
const inEffect = (owner) => ev(`(() => { enqueueEffects([], [{ownerIndex:${owner}, stackUid:null, cardNumber:'BT1-010', cardName:'テスト', field:'effect', lineIndex:0, text:'テスト', timing:'メイン', event:'テスト'}]); renderEffectPanel(); })()`);
const act = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; snapshotPracticeState(); ${js}; renderPracticeBoard(); })()`); await page.waitForTimeout(250); };
const q = (num) => ev(`(() => { const q=getEffectQueue(); return [q.current,...q.pending].filter(Boolean).some(e=>e.cardNumber==='${num}'); })()`);
const tamer = (n) => `{cards:['${n}']}`;

// 1 相手の手札が効果で増えた(BT27-089 テイマー): 効果の処理中なら出る / 効果でなければ出ない
await setup(`P.battle=[${tamer('BT27-089')}]; O.hand=[]; O.library=Array(10).fill('BT1-010')`);
await inEffect(pi); await act(`drawCardsFor(1-${pi}, 1)`);
o.handInc = await q('BT27-089');
// 効果の処理中でも、手で手札に入れた(効果のボタンではない)ときは出ない
await setup(`P.battle=[${tamer('BT27-089')}]; O.hand=[]`);
await inEffect(pi); await act(`O.hand.push(O.library.shift())`);
o.handIncNoEff = await q('BT27-089');
o.ok_handInc = o.handInc === true && o.handIncNoEff === false;
// 1b 効果で相手のデジモンを手札に戻した(バウンス)
await setup(`P.battle=[${tamer('BT27-089')}]; O.hand=[]; O.battle=[{cards:['BT1-010']}]`);
await inEffect(pi); await act(`removeCardFromStackAt(O.battle[0], 0, 'hand', undefined, () => renderPracticeBoard())`);
o.bounce = await q('BT27-089');
o.ok_bounce = o.bounce === true;
// 2 相手の手札が破棄された(BT27-085)/ 自分の手札では出ない
await setup(`P.battle=[{cards:['BT1-009','BT27-085']}]; O.hand=['BT1-010','BT1-015']; O.trash=[]; P.hand=['BT1-010']; P.trash=[]`);
await act(`O.trash.push(O.hand.pop())`);
o.handDisc = await q('BT27-085');
await settle();
await act(`P.trash.push(P.hand.pop())`);
o.handDiscOwn = await q('BT27-085');
o.ok_handDisc = o.handDisc === true && o.handDiscOwn === false;
// 3 自分のテイマーの下のカードが効果で破棄された(BT27-067): テイマーの下から1枚トラッシュへ
await setup(`P.battle=[{cards:['BT1-009','BT27-067']},{cards:[{n:'BT1-010',d:true},'BT27-089']}]; P.trash=[]`);
await act(`removeCardFromStackAt(P.battle[1], 0, 'trash', undefined, () => renderPracticeBoard())`);
o.under = await q('BT27-067');
o.ok_under = o.under === true;
// 4 このデジモンの進化元が効果で増えた(BT27-031)/ 進化(一番上が変わる)では出ない
await setup(`P.battle=[{cards:['BT1-009','BT27-031']}]`);
await inEffect(pi); await act(`placeCardsUnderStack(P.battle[0], ['BT1-010'], false)`);
o.matInc = await q('BT27-031');
// 効果の処理中でも、手で下に入れた(効果のボタンではない)ときは出ない
await setup(`P.battle=[{cards:['BT1-009','BT27-031']}]`);
await inEffect(pi); await act(`P.battle[0].cards.unshift('BT1-010')`);
o.matIncManual = await q('BT27-031');
o.ok_matInc = o.matInc === true && o.matIncManual === false;
// 5 自分のデジモンがバトルエリアを離れた(BT27-068)
await setup(`P.battle=[{cards:['BT1-009','BT27-068']},{cards:['BT1-010']}]; P.hand=[]`);
await act(`P.hand.push(P.battle[1].cards.pop()); P.battle.splice(1,1)`);
o.leave = await q('BT27-068');
o.ok_leave = o.leave === true;
// 6 効果の処理中に(トラッシュから)進化した: 進化の1ドローは「手札が効果で増えた」にしない(自分の手札: BT7-029「効果で自分の手札が増えたとき」)
const lv4 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===4 && c.color.length===1 && c.color[0]==='red' && !/とき|【/.test((c.effect||'')+(c.inherited||''))).number`);
const lv3 = await ev(`[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.level===3 && c.color.length===1 && c.color[0]==='red' && !/とき|【/.test((c.effect||'')+(c.inherited||''))).number`);
await setup(`P.battle=[{cards:['BT1-009','BT7-029']},{cards:['${lv3}']}]; P.hand=[]; P.trash=['${lv4}']; P.library=Array(10).fill('BT1-010')`);
await inEffect(pi);
await ev(`(() => { practiceState.memory=0; enterEvolveMode(0, '${lv4}', false, {source:'trash', effectName:'テスト', costRule:{type:'free'}}); performEvolve(practiceState.players[${pi}].battle[1]); })()`);
await page.waitForTimeout(150);
await page.evaluate(() => { const b = document.querySelector('#evolveRouteModal.open .evolve-route-item:not(.eri-pay)'); b && b.click(); });
await page.waitForTimeout(300);
o.evoDraw = await ev(`practiceState.players[${pi}].hand.length+' '+getStackTopCard(practiceState.players[${pi}].battle[1]).number`);
o.evoTrig = await q('BT7-029');
o.ok_evoDraw = o.evoDraw === '1 ' + lv4 && o.evoTrig === false;
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
