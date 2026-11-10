import { page, ev, errs, browser, autoBtns, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const o=1-v; const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const enqOn = (idx, text) => ev(`(() => { clearEffectQueue(); const st=${P(v)}.battle[${idx}]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(st), cardNumber:'BT1-010', cardName:'テスト', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`);
const pickerClick = async (names, btn) => { for (const n of names) await page.evaluate((n)=>{ const el=[...document.querySelectorAll('*')].find(x=>x.offsetParent && x.children.length===0 && x.textContent.trim()===n); el && el.click(); }, n); await page.evaluate((b)=>{ const x=[...document.querySelectorAll('button')].find(y=>y.offsetParent && y.textContent.trim().startsWith(b)); x && x.click(); }, btn); await page.waitForTimeout(200); };
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; ${P(v)}.battle=[{cards:['BT1-010','BT1-019','BT11-057'],rested:false, links:['BT21-073']},{cards:['BT1-030'],rested:false},{cards:[{n:'BT1-010',d:true},{n:'BT1-030',d:true},'BT24-088'],rested:false}]; ${P(o)}.battle=[{cards:['BT1-010'],rested:false}]; ${P(v)}.trash=['BT1-010','BT24-010','BT1-030']; renderPracticeBoard(); clearEffectQueue(); })()`);
// sources
await enqOn(0, 'このデジモンの進化元を、選んで1枚破棄することで、≪1ドロー≫。');
console.log('src:', await cls()); await clickAuto('代償'); await page.waitForTimeout(200);
await pickerClick(['ダークティラノモン'], '破棄する');
console.log(' ->', await cls(), await ev(`${P(v)}.battle[0].cards.map(miniCardName).join(',')`));
// trash -> deck bottom
await enqOn(0, '自分のトラッシュから、デジモンカード2枚を好きな順番でデッキの下に戻すことで、≪1ドロー≫。');
console.log('trash:', await cls()); await clickAuto('代償'); await page.waitForTimeout(200);
await pickerClick(['グレイモン','ゴマモン'], 'デッキの下に戻す');
console.log(' ->', await cls(), await ev(`${P(v)}.library.slice(-2).map(miniCardName).join(',')`), await ev(`${P(v)}.trash.map(miniCardName).join(',')`));
// link
await enqOn(0, 'このデジモンのリンクカード1枚を破棄することで、≪1ドロー≫。');
console.log('link:', await cls()); await clickAuto('代償'); await page.waitForTimeout(200);
console.log(' ->', await cls(), await ev(`JSON.stringify(${P(v)}.battle[0].links)`));
// tamer under
await enqOn(0, '自分のテイマーの下にある裏向きのカードを下から1枚破棄することで、≪1ドロー≫。');
console.log('tamer:', await cls()); await clickAuto('代償'); await page.waitForTimeout(200);
console.log(' ->', await cls(), await ev(`${P(v)}.battle[2].cards.length`));
// field destroy other
await enqOn(0, '他の自分のデジモン1体を消滅させることで、≪1ドロー≫。');
console.log('field:', await cls()); await clickAuto('代償'); await page.waitForTimeout(200);
console.log(' banner', await page.evaluate(()=>{ const b=document.getElementById('fieldPickBanner'); return b.hidden?'none':b.innerText.replace(/\s+/g,' '); }));
console.log(' cands', await page.evaluate(()=>document.querySelectorAll('.stack-tile.target-pick').length));
await page.evaluate(()=>document.querySelector('.stack-tile.target-pick').click()); await page.waitForTimeout(200);
for (let k=0;k<3;k++){ await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && /決定|そのまま消滅/.test(x.textContent)); b && b.click(); }); await page.waitForTimeout(200); }
console.log(' after field', await cls(), await ev(`practiceState.players[${v}].battle.map(stackLabel).join(',')`));
await browser.close(); console.log(errs);
