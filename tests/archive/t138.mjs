import { page, ev, browser } from '../head.mjs';
const v = await ev('practiceState.viewingIndex'); const P = (i)=>`practiceState.players[${i}]`;
await ev(`(() => { ${P(v)}.battle=[{cards:['BT1-010','BT1-019'],rested:true}]; ${P(v)}.raising={cards:['BT1-010'],rested:false}; renderPracticeBoard(); clearEffectQueue(); })()`);
const r = await ev(`(() => { const st=${P(v)}.battle[0]; const stem={'できる':'する','させられる':'させる'};
 const toCost = (cl) => cl.replace(/(破棄|消滅|登場|リンク|オープン)(でき|させられ)る$/, (a,b)=>b==='消滅'?'消滅させる':b+'する').replace(/戻せる$/, '戻す').replace(/置ける$/, '置く').replace(/加えられる$/, '加える').replace(/させられる$/, 'させる').replace(/にできる$/, 'にする').replace(/できる$/, 'する');
 let total=0, gain=0, ex=[]; const kinds={};
 [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{
   const body = line.replace(/^(?:[【［\\[][^】］\\]]*[】］\\]])+/, '');
   body.split(/。|、その後、/).forEach(seg=>{
     let cl = seg.replace(/^.*?(?:ことで|とき|なら|場合)、/, '').replace(/^(?:この効果で[^、]*、)?/, '').trim();
     if (!cl || /ことで|ごとに|の間|まで、/.test(cl)) return;
     if (!/(する|できる|させる|戻す|置く|加える|置ける|戻せる)$/.test(cl)) return;
     total++;
     const cost = toCost(cl);
     let hs=[]; try { hs = costHandlersForSingle({ownerIndex:${v}, stackUid:ensureStackUid(st), cardNumber:c.number, cardName:'x', text: cost+'ことで、≪1ドロー≫。'}, st); } catch(e){}
     if (!hs.length) return;
     let base=[]; try { base = getEffectHandlers({ownerIndex:${v}, stackUid:ensureStackUid(st), cardNumber:c.number, cardName:'x', field:'effect', text:'【メイン】'+cl+'。'}); } catch(e){}
     if (base.length) return;
     gain++; const k=cost.replace(/「[^」]*」/g,'「」').replace(/\\d+/g,'N').slice(0,40); kinds[k]=(kinds[k]||0)+1;
   });
 })));
 return JSON.stringify({total, gain, top:Object.entries(kinds).sort((a,b)=>b[1]-a[1]).slice(0,30)});
})()`);
const o = JSON.parse(r); console.log(o.total, o.gain); o.top.forEach(x=>console.log(x[1], x[0]));
await browser.close();
