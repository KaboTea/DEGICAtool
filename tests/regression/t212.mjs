// 【セキュリティ】で発揮した【メイン】効果の「このカードを〜デジモンにリンク」: めくったカード(まだどこにも置いていない)をリンクする(BT25-100 アイアンスラッシュ)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const di = await ev(`(() => { const pi=practiceState.turn.playerIndex, di=1-pi; const D=practiceState.players[di]; D.battle=[{cards:['BT1-010']}]; D.trash=[]; D.hand=[]; const A=practiceState.players[pi]; A.battle=[{cards:['BT1-015']}]; clearEffectQueue(); renderPracticeBoard();
  attackState = { attackerStack: A.battle[0], defenderOwner: D, secPending: { top: 'BT25-100', resolve: (d) => { window.__dest=d; attackState.secPending=null; if (d!=='linked') D.trash.push('BT25-100'); } } };
  return di; })()`);
o.r = await ev(`(() => { const c=cardIndexByNumber.get('BT25-100'); const line=c.effect.split('\\n').find(l=>/^【メイン】/.test(l));
  const h=getEffectHandlers({ownerIndex:${di}, lki:true, lkiUid:'sec-x', stackUid:null, cardNumber:'BT25-100', cardName:c.name, field:'effect', lineIndex:0, text:parseEffectLine(line).text, timing:'メイン', event:'参照'}).find(h=>/リンク/.test(h.label));
  if (!h) return 'nobtn'; h.run(); const D=practiceState.players[${di}]; return window.__dest+' links='+(D.battle[0].links||[]).join()+' trash='+D.trash.length; })()`);
o.ok = o.r === 'linked links=BT25-100 trash=0';
console.log(JSON.stringify(o));
await browser.close(); console.log(o.ok ? errs : ['ng']);
