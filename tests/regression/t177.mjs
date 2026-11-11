// v0.97.4: 「DP4000以下の相手のデジモン1体を消滅」で条件外を最初から選べない・「表向きのセキュリティ1枚ごとに≪退化1≫」
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
// 1 条件に合うものがいないとき、条件外は最初は選べない
o.dp = await ev(`(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi];
 const big=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && c.dp>=11000).number;
 P.battle=[{cards:['EX13-010']}]; O.battle=[{cards:[big]}]; renderPracticeBoard();
 const c=cardIndexByNumber.get('EX13-010'); const line=c.effect.split('\\n')[0];
 getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'EX13-010', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'進化時', event:'進化'}).find(x=>/消滅/.test(x.label)).run();
 const r = fieldPickMode && !fieldPickMode.showExtra && fieldPickMode.candidates.length===0 && /条件に合うものがいません/.test(fieldPickMode.sub||''); cancelFieldPick(); return r; })()`);
// 2 表向きのセキュリティ1枚ごとに≪退化1≫
const r = await ev(`(() => { const pi=practiceState.turn.playerIndex; const P=practiceState.players[pi], O=practiceState.players[1-pi];
 const card=[...cardIndexByNumber.values()].find(c=>/表向きのセキュリティ1枚ごとに、≪退化1≫/.test((c.effect||'')+(c.inherited||'')+(c.security_effect||'')));
 if(!card) return 'nocard';
 const line=[card.effect,card.inherited,card.security_effect].join('\\n').split('\\n').find(l=>/ごとに、≪退化1≫/.test(l));
 P.battle=[{cards:[card.category==='digimon'?card.number:'BT1-010']}]; P.security=[{n:'BT1-010',u:1},{n:'BT1-019',u:1},'BT1-053'];
 O.battle=[{cards:['BT1-010','BT1-019','BT1-053']}]; renderPracticeBoard();
 const h=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:card.number, cardName:card.name, field:'effect', lineIndex:0, text:line, timing:'x', event:'t'}).find(x=>/退化/.test(x.label));
 if(!h) return 'nohandler:'+line;
 window.__lab=h.label; console.log(line); h.run(); return 'ok:'+line; })()`);
o.handler = r.startsWith('ok') || r; console.log(r);
o.label = await ev(`/表向きのセキュリティ1枚ごとに≪退化1≫/.test(window.__lab||'')`);
await page.waitForTimeout(200);
console.log(await ev(`[!!fieldPickMode, fieldPickMode && fieldPickMode.candidates.length, fieldPickMode && fieldPickMode.title]`));
await ev(`(() => { const O=practiceState.players[1-practiceState.turn.playerIndex]; if (fieldPickMode) { fieldPickMode.selected=[O.battle[0]]; finishFieldPick(); } })()`).catch(() => {});
console.log(await page.evaluate(() => [...document.querySelectorAll('.toast')].map(t=>t.textContent).join('|')));
await page.waitForTimeout(300);
// 2枚の≪退化≫: 何枚破棄するか聞かれたら2枚
await page.evaluate(() => { const b=[...document.querySelectorAll('#attackBarActs button')].find(x=>/^2枚/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(300);
o.degen2 = await ev(`practiceState.players[1-practiceState.turn.playerIndex].battle[0].cards.length === 1`); console.log(await ev(`[practiceState.players[1-practiceState.turn.playerIndex].battle[0].cards.length, !!fieldPickMode]`), await (await import('../head.mjs')).bar());
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
