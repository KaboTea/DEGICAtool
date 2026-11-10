import { page, ev, browser } from '../head.mjs';
import fs from 'fs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT24-088'],rested:false}]; renderPracticeBoard(); clearEffectQueue(); })()`);
const rows = fs.readFileSync('miss7.tsv','utf8').trim().split('\n').slice(1).map(l=>l.split('\t'));
const r = await ev(`(() => { const st=${P(v)}.battle[0]; return JSON.stringify(${JSON.stringify(rows)}.map(([n,c])=>{ const hs=getEffectHandlers({ownerIndex:${v}, stackUid:ensureStackUid(st), cardNumber:n, cardName:'x', field:'effect', text:'【メイン】'+c+'。'}); return n+'\\t'+c.slice(0,40)+'\\t'+hs.map(h=>h.label).join(' | '); })); })()`);
JSON.parse(r).forEach(x=>console.log(x));
await browser.close();
