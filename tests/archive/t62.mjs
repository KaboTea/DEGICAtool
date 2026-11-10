import { page, ev, browser } from '../head.mjs';
import fs from 'fs';
const me='practiceState.players[practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['BT1-010'],rested:false}]; renderPracticeBoard(); })()`);
const res = await ev(`(() => { const out=[]; let tot=0, ok=0; [...cardIndexByNumber.values()].forEach(c => [['effect',c.effect],['inherited',c.inherited],['security_effect',c.security_effect],['dual',c.dual&&c.dual.effect]].forEach(([f,t]) => (t||'').split('\\n').forEach((line,li) => { const p=parseEffectLine(line); if(!p.labels.length) return; if (p.labels.every(l=>/^(自分のターン|相手のターン|お互いのターン)$/.test(l)) && !/とき/.test(line)) return; tot++; let hs=[]; try { hs = getEffectHandlers({ownerIndex:practiceState.viewingIndex, cardNumber:c.number, cardName:c.name, field:f==='dual'?'effect':f, lineIndex:li, text:p.text, timing:p.labels[0], event:'test', lki:true, lkiUid:'x', stackUid:null}) || []; } catch(e) { hs=[]; } if (hs.length) ok++; else out.push(c.number+'\\t'+engineStripNotes(p.text)); }))); return JSON.stringify({tot, ok, out}); })()`);
const r = JSON.parse(res); console.log(r.tot, r.ok); fs.writeFileSync('unhandled.tsv', r.out.join('\n'));
await browser.close();
