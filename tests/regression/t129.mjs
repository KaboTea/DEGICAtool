import { page, ev, errs, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
console.log(await ev(`(() => { const ks=[...cardIndexByNumber.values()].filter(c=>/^(ケレスモン|クロノモン.*|ユピテルモン)$/.test(c.name)).map(c=>c.number+' '+c.name+' Lv'+c.level+' cost'+c.play_cost); return ks.join('\\n'); })()`));
const r = await ev(`(() => { const p=${P(v)}; const ker=[...cardIndexByNumber.values()].find(c=>c.name==='ケレスモン' && c.play_cost===12); p.battle=[{cards:['BT1-010', ker.number, 'BT26-032'],rested:false}]; const st=p.battle[0]; const ks=keishoSourceOf(st); return JSON.stringify({ker:ker.number, ks: ks && [ks.card.number, ks.index], text: ks && keishoTextOf(ks.card), srcs: getStackEffectSources(st).map(s=>s.field+':'+s.card.name), trig: collectStackTriggers(st, ${v}, 'battle', ['進化時']).map(t=>t.field+':'+t.cardName+':'+t.text.slice(0,30)), dp:getEffectiveDP(st), blocker: hasBlockerKeyword(st), renkei: hasRenkeiKeyword(st), pierce: hasPierceKeyword(st)}); })()`);
console.log(JSON.stringify(JSON.parse(r), null, 1));
await browser.close(); console.log(errs);
