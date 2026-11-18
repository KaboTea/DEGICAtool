// 「相手のセキュリティがN枚になるように上から破棄する」(BT21-098 ラグナロク・キャノンの≪ディレイ≫など) / お互いはそれぞれ(BT23-102)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const run = (num, line, re, js) => ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; ${js}; renderPracticeBoard(); clearEffectQueue(); practiceState.viewingIndex=${pi};
  const c=cardIndexByNumber.get('${num}'); const hs=getEffectHandlers({ownerIndex:${pi}, stackUid:P.battle[0]?ensureStackUid(P.battle[0]):null, cardNumber:'${num}', cardName:c.name, field:'effect', lineIndex:0, text:${JSON.stringify(line)}, timing:'メイン', event:'t'});
  const h=hs.find(h=>${re}.test(h.label)); if(!h) return 'nobtn:'+hs.map(h=>h.label).join('/'); h.run(); return P.security.length+'/'+O.security.length+' trash='+O.trash.length; })()`);
const S = `Array(5).fill('BT1-010')`;
o.rag = await run('BT21-098', '最も登場コストの低い相手のデジモン1体を消滅させる。この効果で消滅しなかったなら、相手のセキュリティが1枚になるように上から破棄する。', '/1枚になるように/', `P.battle=[]; P.security=${S}; O.security=${S}; O.trash=[]`);
o.ok_rag = o.rag === '5/1 trash=4';
o.few = await run('BT21-098', '最も登場コストの低い相手のデジモン1体を消滅させる。この効果で消滅しなかったなら、相手のセキュリティが1枚になるように上から破棄する。', '/1枚になるように/', `P.battle=[]; O.security=['BT1-010']; O.trash=[]`);
o.ok_few = /\/1 trash=0$/.test(o.few);
o.both = await run('BT23-102', 'お互いはそれぞれセキュリティが3枚になるように上から破棄する。', '/お互いのセキュリティが3枚/', `P.battle=[]; P.security=${S}; O.security=Array(4).fill('BT1-010'); O.trash=[]`);
o.ok_both = o.both === '3/3 trash=1';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
