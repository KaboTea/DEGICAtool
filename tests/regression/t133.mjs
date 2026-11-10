import { page, ev, errs, browser, clickAuto } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
const cls = () => page.evaluate(()=>[...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b=>(b.classList.contains('cond-ng')?'[NG]':'')+b.textContent));
const st = () => ev(`JSON.stringify({me:${P(v)}.battle.map(s=>s.cards.map(x=>miniCardName(cardEntryNum(x))+(cardEntryFaceDown(x)?'(裏)':'')).join('/')+(s.links&&s.links.length?'+L:'+s.links.map(miniCardName).join(','):'')), trash:${P(v)}.trash.map(miniCardName).join(','), sec:${P(v)}.security.length, hand:${P(v)}.hand.length})`);
const setup = async (num, battle, extra) => { await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=${v}; const p=${P(v)}; p.battle=${JSON.stringify(battle)}.map(c=>Array.isArray(c)?({cards:c,rested:false}):c); ${extra||''}; renderPracticeBoard(); clearEffectQueue(); const line=cardIndexByNumber.get('${num}').effect.split('\\n').concat((cardIndexByNumber.get('${num}').inherited||'').split('\\n')).find(l=>/ことで/.test(l)); enqueueEffects([], [{ownerIndex:${v}, stackUid: ensureStackUid(p.battle[0]), cardNumber:'${num}', cardName:'${num}', field:'effect', lineIndex:0, text:line, timing:'メイン', event:'t'}]); renderEffectPanel(); })()`); console.log('##', num, await st(), JSON.stringify(await cls())); };
const tapN = async (i) => { await page.evaluate((i)=>document.querySelectorAll('.stack-tile.target-pick')[i].click(), i); await page.waitForTimeout(150); };
const confirm = async () => { await page.evaluate(()=>{ const b=[...document.querySelectorAll('#fieldPickBanner button')].find(x=>/決定/.test(x.textContent)); b&&b.click(); }); await page.waitForTimeout(200); };
const pick = async (names, btn) => { for (const n of names) await page.evaluate((n)=>{ const el=[...document.querySelectorAll('#cardDetailModal *')].find(x=>x.offsetParent && x.children.length===0 && x.textContent.trim()===n); el && el.click(); }, n); await page.evaluate((b)=>{ const x=[...document.querySelectorAll('button')].find(y=>y.offsetParent && y.textContent.trim()===b); x && x.click(); }, btn); await page.waitForTimeout(200); };
// tamer + trash
await setup('BT17-080', [['BT17-080'], ['BT1-010','BT2-016']], `p.trash=[...cardIndexByNumber.values()].filter(c=>c.name==='グラウモン'||c.name==='メガログラウモン').slice(0,2).map(c=>c.number); p.battle[1].cards=[[...cardIndexByNumber.values()].find(c=>c.name==='ギルモン').number]`);
await clickAuto('代償'); await page.waitForTimeout(200); console.log(' ->', await st(), JSON.stringify(await cls()));
// option to battle
await setup('BT19-086', [['BT1-010']], `p.hand.push([...cardIndexByNumber.values()].find(c=>c.category==='option' && /デヴァイス/.test(c.type||'')).number)`);
await clickAuto('代償'); await page.waitForTimeout(200); await page.evaluate(()=>{ const el=[...document.querySelectorAll('#cardDetailModal .cmp-item, #cardDetailModal [data-k]')][0]; }); 
const optName = await ev(`miniCardName(${P(v)}.hand[${P(v)}.hand.length-1])`); await pick([optName], 'バトルエリアに置く'); console.log(' ->', await st(), JSON.stringify(await cls()));
// security -> tamer face down
await setup('BT26-025', [['BT1-010']], `p.battle.push({cards:[[...cardIndexByNumber.values()].find(c=>c.category==='tamer' && /グローイングドーン/.test(c.type||'')).number],rested:false})`);
await clickAuto('代償'); await page.waitForTimeout(200); console.log(' ->', await st(), JSON.stringify(await cls()));
// fallback: hand play (P-021)
await setup('P-021', [['BT1-010']], `p.hand.push([...cardIndexByNumber.values()].find(c=>c.name==='パルモン').number)`);
await clickAuto('代償'); await page.waitForTimeout(300); console.log(' modal', await page.evaluate(()=>document.getElementById('cardDetailModal').classList.contains('open') || !!document.querySelector('.modal.open')), JSON.stringify(await cls()));
// link discard
await setup('BT25-073', [{cards:['BT1-010'],rested:false,links:['BT21-009']}]);
await clickAuto('代償'); await page.waitForTimeout(200); await pick(['ガッチモン'], '破棄する'); console.log(' ->', await st(), JSON.stringify(await cls()));
// 上か下だけ
await setup('EX12-077', [['BT1-010']], `p.hand.push('RB1-005','RB1-005')`);
await browser.close(); console.log(errs);
