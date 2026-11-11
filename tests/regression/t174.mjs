// v0.97.2: 「手札かこのデジモンの進化元から〜をこのデジモンに支払うリンクコスト-2でリンクできる」等のリンク効果のボタン
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const r = await ev(`(() => { const pi=practiceState.turn.playerIndex; practiceState.viewingIndex=pi; const P=practiceState.players[pi]; practiceState.turn.phase='main';
  const lc=[...cardIndexByNumber.values()].find(c=>c.category==='digimon' && /〈リンク〉/.test(c.inherited||'') && /ソーシャル/.test(JSON.stringify(c)) && buildLinkRoutes(c).length && buildLinkRoutes(c)[0].cost>=2);
  if(!lc) return 'nocard';
  P.battle=[{cards:['ST22-12']}]; P.hand=[lc.number,'BT1-010']; practiceState.memory=0; renderPracticeBoard();
  const st=P.battle[0]; const line=cardIndexByNumber.get('ST22-12').effect.split('\\n').find(l=>/リンクコスト/.test(l));
  const e={ownerIndex:pi, stackUid:ensureStackUid(st), cardNumber:'ST22-12', cardName:'テスト', field:'effect', lineIndex:0, text:line, timing:'アタック時', event:'t'};
  const h=getEffectHandlers(e).find(h=>/🔗/.test(h.label)); if(!h) return 'nohandler';
  window.__lc=lc.number; window.__cost=Math.max(0,buildLinkRoutes(lc)[0].cost-2); h.run(); return 'ok'; })()`);
o.handler = r === 'ok' || r;
await page.waitForTimeout(300);
await page.evaluate(() => { const row=[...document.querySelectorAll('#detailBody .cmp-row')].find(x=>!/BT1-010|アグモン/.test(x.textContent)); row && row.click(); });
await page.waitForTimeout(150);
await page.evaluate(() => { const b=[...document.querySelectorAll('#detailBody button, .cmp-actions button')].find(b=>/リンクさせる/.test(b.textContent)); b && b.click(); });
await page.waitForTimeout(300);
o.linked = await ev(`(() => { const P=practiceState.players[practiceState.viewingIndex]; return (P.battle[0].links||[]).includes(window.__lc) && !P.hand.includes(window.__lc); })()`);
o.paid = await ev(`(() => { const pi=practiceState.turn.playerIndex; return Math.abs(practiceState.memory) === window.__cost; })()`);
// ラベル: このカード
o.selfLabel = await ev(`linkEffectHandlersFor({ownerIndex:0, cardNumber:'ST22-08', cardName:'x', text:cardIndexByNumber.get('ST22-08').effect, field:'effect', lineIndex:0}, null)[0].label.startsWith('🔗 このカードを')`);
const ng = Object.entries(o).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
