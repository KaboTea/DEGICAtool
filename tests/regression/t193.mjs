// v0.98.7: 手札/トラッシュから進化・登場する効果は、ボタン1つで両方の場所のカードを1つの画面に出す。
//          「進化条件を無視して」がなければ、場の候補に進化できない(Lv・色などが合わない)カードは選択肢に出さない
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const setup = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; practiceState.turn.playerIndex=pi; P.battle=[{cards:['BT16-071']}]; P.raising=null;
  const st=P.battle[0]; const leo=[...cardIndexByNumber.values()].filter(c=>c.category==='digimon' && /レオモン/.test(c.name) && c.number!=='BT16-071');
  const ok=leo.filter(c=>canEvolveOntoStack(c, st)), ng=leo.filter(c=>!canEvolveOntoStack(c, st));
  if (ok.length<2 || !ng.length) return 'nocards';
  P.hand=[ok[0].number, ng[0].number]; P.trash=[ok[1].number];
  window.__t={ ok0: ok[0].number, ok1: ok[1].number, ng0: ng[0].number }; return 'ok'; })()`);
o.setup = setup;
o.oneButton = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; const c=cardIndexByNumber.get('BT16-071'); const line=c.effect.split('\\n').find(l=>/レオモン/.test(l) && /進化/.test(l));
  const hs=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT16-071', cardName:c.name, field:'effect', lineIndex:0, text:line, timing:'アタック時', event:'アタック'}).filter(h=>/から進化/.test(h.label));
  if (hs.length!==1) return hs.map(h=>h.label).join('/'); hs[0].run(); return /手札\\/トラッシュ/.test(hs[0].label); })()`);
await page.waitForTimeout(200);
o.list = await ev(`(() => { const rows=[...document.querySelectorAll('#detailBody .eep-row, #detailBody [data-num]')]; const txt=document.getElementById('detailBody').innerText;
  const nm=n=>cardIndexByNumber.get(n).name; return { hasOk0: txt.includes(nm(__t.ok0)), hasOk1: txt.includes(nm(__t.ok1)) && /トラッシュ/.test(txt), goes: document.querySelectorAll('#detailBody .eep-go').length }; })()`);
o.listOk = o.list.goes === 2 && o.list.hasOk0 && o.list.hasOk1;
// 3枚(進化できる2枚+できない1枚)のうち、選べる行は2つだけ(進化条件に合わない1枚は出ない。「条件外も表示」にも出ない)
o.ngHidden = await ev(`document.querySelectorAll('#detailBody .eep-go').length === 2 && !/条件外も表示/.test(document.getElementById('detailBody').innerText)`);
await ev(`cardDetailModal.classList.remove('open')`);
// 登場: 手札/トラッシュの両方からボタン1つ(BT13-041「クダモン」)
o.play = await ev(`(() => { const pi=practiceState.viewingIndex; const P=practiceState.players[pi]; P.battle=[{cards:['BT13-041']}];
  const kuda=[...cardIndexByNumber.values()].find(c=>c.name==='クダモン').number; P.hand=[kuda]; P.trash=[kuda];
  const c=cardIndexByNumber.get('BT13-041'); const line=c.inherited;
  const hs=getEffectHandlers({ownerIndex:pi, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT13-041', cardName:c.name, field:'inherited', lineIndex:0, text:line, timing:'消滅時', event:'消滅'}).filter(h=>/から登場/.test(h.label));
  if (hs.length!==1) return hs.map(h=>h.label).join('/'); hs[0].run(); return document.querySelectorAll('#detailBody .eep-go').length===2 && /トラッシュ/.test(document.getElementById('detailBody').innerText); })()`);
const ng = Object.entries(o).filter(([k, x]) => !['setup', 'list'].includes(k) && x !== true).map(([k]) => k);
if (o.setup !== 'ok') ng.push('setup');
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
