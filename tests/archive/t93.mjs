import { page, ev, browser } from '../head.mjs';
import fs from 'fs';
const r = await ev(`(() => { const rows=[]; [...cardIndexByNumber.values()].forEach(c=>['effect','inherited','security_effect'].forEach(f=>(c[f]||'').split('\\n').forEach(line=>{ const body=engineStripNotes(line); body.split('。').forEach(s=>{ const m=/(?:^|、|】|］)([^、。【】]*?(?:、[^、。【】]*?)?)(?:する|させる|戻す|置く|破棄する|支払う|加える)?ことで、/.exec(s); if(!m) return; const k=/ことで、/.exec(s); let cost=s.slice(0,k.index).replace(/^(?:【[^】]+】|［[^］]*］|\\[[^\\]]*\\]|\\{[^}]*\\})+/,''); cost=cost.replace(/^.*?(とき|なら|場合|その後)、/,''); rows.push(c.number+'\\t'+f+'\\t'+cost); }); }))); return rows.join('\\n'); })()`);
fs.writeFileSync('costs.tsv', r);
console.log(r.split('\n').length);
await browser.close();
