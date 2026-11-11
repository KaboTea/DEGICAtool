// v0.96.9: 場にいるだけで効く付与(「〜自分のデジモン全ては≪X≫を得る」・「自分の「大門大」全てはデジモン・DPNとしても扱い」・Sアタック)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const pi = await ev('practiceState.turn.playerIndex');
const r = await ev(`(() => { const P=practiceState.players[${pi}]; const O=practiceState.players[1-${pi}]; const o={};
 const find=(pred)=>[...cardIndexByNumber.values()].find(pred).number;
 const db=find(c=>c.category==='digimon'&&/D-ブリガード/.test([c.type,c.form,c.attribute].join('/'))&&!/全ては/.test(c.effect||''));
 O.battle=[{cards:['BT14-068']},{cards:[db]},{cards:['BT1-010']}]; renderPracticeBoard();
 o.blocker = hasInnateOrLinkedKeyword(O.battle[1],'ブロッカー') && !hasInnateOrLinkedKeyword(O.battle[2],'ブロッカー');
 o.notOwnTurn = (() => { P.battle=[{cards:['BT14-068']},{cards:[db]}]; return !hasInnateOrLinkedKeyword(P.battle[1],'ブロッカー'); })();
 // BT25-104: 自分のターンに大門大がDP12000のデジモン・速攻
 const dai=find(c=>c.category==='tamer'&&c.name==='大門大');
 P.battle=[{cards:['BT1-010','BT25-104']},{cards:[dai]},{cards:['BT1-085']}];
 o.daiDigimon = isDigimonLikeStack(P.battle[1]) && getEffectiveDP(P.battle[1])===12000 && hasQuickKeyword(P.battle[1]) && !isDigimonLikeStack(P.battle[2]);
 o.daiOppTurn = (() => { O.battle=[{cards:['BT1-010','BT25-104']},{cards:[dai]}]; return !isDigimonLikeStack(O.battle[1]); })();
 // BT1-085(八神太一): 進化元4枚以上の赤の自分のデジモン全てSアタック+1
 P.battle=[{cards:['BT1-085']},{cards:['BT1-010','BT1-010','BT1-010','BT1-010','BT1-019']},{cards:['BT1-010','BT1-019']}];
 o.sattack = effectiveSAttackBonus(P.battle[1]) - (getInnateSAttackBonus(getStackTopCard(P.battle[1]))||0) === 1 && effectiveSAttackBonus(P.battle[2]) - (getInnateSAttackBonus(getStackTopCard(P.battle[2]))||0) === 0;
 // BT11-086: 特徴クロスハートor道連れ の自分全て 速攻
 const ch=find(c=>c.category==='digimon'&&/クロスハート/.test([c.type,c.form,c.attribute].join('/'))&&!/≪速攻≫/.test(c.effect||''));
 P.battle=[{cards:['BT11-086']},{cards:[ch]},{cards:['BT1-010']}];
 o.quick = hasQuickKeyword(P.battle[1]) && !hasQuickKeyword(P.battle[2]);
 const t0=performance.now(); for(let i=0;i<20;i++) renderPracticeBoard(); o.ms=Math.round((performance.now()-t0)/20);
 return o; })()`);
delete r.ms; const ng = Object.entries(r).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(r));
await browser.close(); console.log(ng.length ? ng : errs);
