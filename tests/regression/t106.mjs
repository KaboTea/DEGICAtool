import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const clickBtn = (t) => page.evaluate((t)=>{ const b=[...document.querySelectorAll('button')].find(x=>x.offsetParent && x.textContent.trim()===t); b && b.click(); return !!b; }, t);
const tapStack = (expr) => ev(`(() => { const st=${expr}; const el=[...document.querySelectorAll('[data-pick-uid],[data-uid]')].find(x=>(x.dataset.pickUid||x.dataset.uid)===ensureStackUid(st)); if(el){el.click(); return 'tapped';} return 'noel'; })()`);
const txt = (n) => ev(`cardIndexByNumber.get('${n}').effect`);
console.log('BT12-087:', await txt('BT12-087'));
// A: tamer rest + tamer-under card to digimon
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false},{cards:['BT1-030','BT12-087'],rested:false}]; p.memory=0; renderPracticeBoard(); clearEffectQueue(); const st=p.battle[1]; enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(st), cardNumber:'BT12-087', cardName:'テストA', field:'effect', lineIndex:0, text:'【自分のターン】このテイマーをレストさせ、自分のテイマーの下のカード1枚をそのデジモンの進化元の下に置くことで、≪1ドロー≫。', timing:'自分のターン', event:'t'}]); renderEffectPanel(); })()`);
console.log('A0', await cls());
console.log('A1 rested', await ev(`${P(v)}.battle[1].rested`));
// v0.96.10: レストの代償はボタンを押すまでレストしない
await clickAuto('代償1/2'); await page.waitForTimeout(150);
console.log('A1b rested', await ev(`${P(v)}.battle[1].rested`));
await clickAuto('代償2/2'); await page.waitForTimeout(150);
console.log('picker:', await clickBtn('置く'));
await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(x=>x.offsetParent && x.children.length===0 && x.textContent.trim()==='ゴマモン'); el && el.click(); });
console.log('placed btn', await clickBtn('置く')); await page.waitForTimeout(200);
console.log('A2', await cls(), await ev(`${P(v)}.battle.map(s=>s.cards.map(miniCardName).join('/')).join(' | ')`));
// B: hand card, 1 cost + this card under digimon
await ev(`(() => { const p=${P(v)}; p.battle=[{cards:['BT1-010'],rested:false}]; p.hand.push('EX6-007'); renderPracticeBoard(); clearEffectQueue(); enqueueEffects([], [{ownerIndex:${v}, stackUid:null, cardNumber:'EX6-007', cardName:'テストB', field:'effect', lineIndex:0, text:cardIndexByNumber.get('EX6-007').effect.split('\\n').find(l=>/コスト支払い/.test(l)), timing:'手札', event:'t'}]); renderEffectPanel(); })()`);
console.log('B text', await ev(`cardIndexByNumber.get('EX6-007').effect`));
console.log('B0', await cls(), await ev('practiceState.memory'));
await clickAuto('代償1/2'); await page.waitForTimeout(150);
console.log('B1', await cls(), await ev('practiceState.memory'));
await clickAuto('代償2/2'); await page.waitForTimeout(200);
console.log('banner', await page.evaluate(() => { const b=document.getElementById('fieldPickBanner'); return b.hidden ? '(no banner)' : b.innerText.replace(/\s+/g,' '); }));
console.log('B2', await cls(), await ev(`${P(v)}.battle[0].cards.map(miniCardName).join('/')`), await ev(`${P(v)}.hand.includes('EX6-007')`));
// C: OR
await ev(`(() => { const p=${P(v)}; p.battle=[{cards:['BT1-010','BT1-030'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'BT26-082', cardName:'テストC', field:'effect', lineIndex:0, text:'【アタック時】このデジモンを消滅させるか、自分のテイマーの下にある裏向きのカードを下から2枚破棄することで、≪1ドロー≫。', timing:'アタック時', event:'t'}]); renderEffectPanel(); })()`);
console.log('C0', await cls());
await browser.close(); console.log(errs);
