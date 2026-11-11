// v0.96.1: 進化元から登場(ほかのデジモン/色で絞る/「進化元の〜を」)と、このカード自身の登場(トラッシュから-2)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const hs = (num, line, idx, field) => ev(`(() => { const P=practiceState.players[${pi}]; return getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[${idx||0}]), cardNumber:'${num}', cardName:'x', field:'${field||'effect'}', lineIndex:0, text:${JSON.stringify(line)}, timing:'登場時', event:'t'}); })()`);
// 1 青の自分のデジモン1体の進化元から(EX2-016): 候補が青のデジモンだけ、Lv.3を出す
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT1-010','BT1-019']},{cards:['ST2-01','ST2-03','ST2-06']}]; renderPracticeBoard(); })()`);
o.c1 = await ev(`(() => { const P=practiceState.players[${pi}]; const h=getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[0]), cardNumber:'EX2-016', cardName:'x', field:'effect', lineIndex:0, text:'【登場時】青の自分のデジモン1体の進化元から、Lv.3のデジモンカード1枚をコストを支払わずに登場できる。', timing:'登場時', event:'t'}).find(h=>/🧩/.test(h.label)); h.run(); return h.label; })()`);
await page.waitForTimeout(300);
o.picker = await page.evaluate(() => document.querySelector('#cardDetailModal.open') ? [...document.querySelectorAll('.eep-row')].map(r=>r.innerText.replace(/\s+/g,' ')).join(' | ') : '(no picker)');
await page.evaluate(() => document.querySelector('.eep-row:not(.eep-ng) .eep-go').click()); await page.waitForTimeout(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('#evolveRouteModal button, .erm-route, .route-row button')].find(x=>/効果で登場/.test(x.textContent)); if (b) b.click(); });
await page.waitForTimeout(300);
o.after = await ev(`practiceState.players[${pi}].battle.map(s=>s.cards.map(cardEntryNum).join('>'))`);
// 2 このカード自身(トラッシュから -2)
await ev(`(() => { const P=practiceState.players[${pi}]; P.trash.push('BT24-076'); })()`);
o.c2 = (await ev(`(() => { const P=practiceState.players[${pi}]; return getEffectHandlers({ownerIndex:${pi}, stackUid:null, zone:'trash', cardNumber:'BT24-076', cardName:'x', field:'effect', lineIndex:0, text:'{トラッシュ}【メイン】自分の手札が4枚以下なら、このカードを支払う登場コスト-2で登場させる。', timing:'メイン', event:'t'}).map(h=>h.label); })()`));
const parsed = await ev(`[parseSourcePlays('【アタック時】このデジモンの進化元のLv.4以下のデジモンカード1枚を、コストを支払わずに別のデジモンとして登場させる。').length, parseSourcePlays('【お互いのターン】このデジモンがバトルエリアを離れるとき、このデジモンの進化元から、赤のLv.4以下のデジモンカード1枚を手札に戻すか、コストを支払わずに登場できる。').length, parseSourcePlays('・育成エリアの自分のデジモンの進化元の特徴に「ロイヤルナイツ」を持つカード1枚をコストを支払わずに登場させる。')[0].who, parseSourcePlays('【メイン】自分のデジモン1体の進化元のデジモンカード2枚までを選び、そのカードをコストを支払わずに別のデジモンとして登場させる。')[0].count]`);
const chk = { c1: /青の/.test(o.c1), picker: /ガブモン/.test(o.picker) && !/BT1-019|ギルモン/.test(o.picker), after: o.after.includes('ST2-03') && o.after.includes('ST2-01>ST2-06'), c2: o.c2.some(x => /このカードをトラッシュから登場\(コスト-2\)/.test(x)),
  p1: parsed[0] === 1, p2: parsed[1] === 1, p3: parsed[2] === 'raising', p4: parsed[3] === 2 };
const ng = Object.entries(chk).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(chk));
await browser.close(); console.log(ng.length ? ng : errs);
