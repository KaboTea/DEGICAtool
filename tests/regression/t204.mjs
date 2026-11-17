// ≪セーブ≫(【消滅時】このカードを自分のテイマーの下へ) / 相手の手札を破棄(相手が選ぶ・見ないで) / 「DPの合計が〜以下になるように」の消滅
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const settle = async () => { await page.waitForTimeout(60); await ev(`(() => { clearEffectQueue(); practiceState.viewingIndex=practiceState.turn.playerIndex; renderPracticeBoard(); })()`); await page.waitForTimeout(30); };
const setup = async (js) => { await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; ${js}; renderPracticeBoard(); })()`); await settle(); };
const run = (num, timing, re, holder) => ev(`(() => { const P=practiceState.players[${pi}]; const c=cardIndexByNumber.get('${num}'); const f=(c.effect||'').includes('【${timing}】')?'effect':'inherited'; const l=c[f].split('\\n').find(x=>x.includes('【${timing}】'));
  const h=getEffectHandlers({ownerIndex:${pi}, stackUid:${holder ? 'ensureStackUid(P.battle[0])' : 'null'}, lki:${holder ? 'false' : 'true'}, cardNumber:'${num}', cardName:c.name, field:f, lineIndex:0, text:parseEffectLine(l).text, timing:'${timing}', event:'t'}).find(h=>${re}.test(h.label));
  if (!h) return 'nobtn'; h.run(); return true; })()`);

// 1 ≪セーブ≫: トラッシュのこのカードをテイマー(1体)の下の一番下へ
await setup(`P.battle=[{cards:['BT2-087']}]; P.trash=['BT1-009','BT10-008']`);
o.save = await run('BT10-008', '消滅時', '/セーブ/', false);
o.saved = await ev(`(() => { const P=practiceState.players[${pi}]; return P.battle[0].cards.join('+')+' trash='+P.trash.join(); })()`);
o.ok_save = o.save === true && o.saved === 'BT10-008+BT2-087 trash=BT1-009';

// 2 相手が選んで2枚破棄(BT4-088)
await setup(`P.battle=[{cards:['BT4-088']}]; O.hand=['BT1-010','BT1-015','BT1-016']; O.trash=[]`);
await run('BT4-088', '消滅時', '/相手が相手の手札/', true); await page.waitForTimeout(150);
await page.evaluate(() => { [...document.querySelectorAll('#detailBody .cmp-row')].slice(0, 2).forEach(r => r.click()); [...document.querySelectorAll('#detailBody button')].find(x => /破棄する/.test(x.textContent) && !x.disabled).click(); });
await page.waitForTimeout(200);
o.opp = await ev(`(() => { const O=practiceState.players[1-${pi}]; return O.hand.length+'/'+O.trash.length; })()`);
o.ok_opp = o.opp === '1/2';

// 3 見ないで1枚(EX6-059)
await setup(`P.battle=[{cards:['EX6-059']}]; O.hand=['BT1-010','BT1-015','BT1-016']; O.trash=[]`);
await run('EX6-059', '登場時', '/見ないで/', true); await page.waitForTimeout(150);
o.blind = await ev(`(() => { const O=practiceState.players[1-${pi}]; return O.hand.length+'/'+O.trash.length; })()`);
o.ok_blind = o.blind === '2/1';

// 4 DPの合計が10000以下(BT9-094): 4000+5000 は選べる
await setup(`P.battle=[]; O.battle=[{cards:['BT1-015']},{cards:['BT1-016']},{cards:['BT1-021']}]`);
o.dpsum = await ev(`(() => { const c=cardIndexByNumber.get('BT9-094'); const l=c.effect.split('\\n').find(x=>/DPの合計/.test(x)); const hs=getEffectHandlers({ownerIndex:${pi}, stackUid:null, cardNumber:'BT9-094', cardName:c.name, field:'effect', lineIndex:0, text:parseEffectLine(l).text, timing:'メイン', event:'使用'}); const h=hs.find(h=>/DP合計10000/.test(h.label)); if(!h) return 'nobtn'; h.run(); return fieldPickMode ? fieldPickMode.candidates.length : 'nopick'; })()`);
await ev('cancelTargetModes()');
o.ok_dpsum = o.dpsum === 3;

const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
