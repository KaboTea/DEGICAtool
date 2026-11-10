import { page, ev, errs, browser } from '../head.mjs';
import fs from 'fs';
for (const f of ['deckA.txt','deckB.txt']) {
  const r = await ev(`(() => { deckState.eggs={}; deckState.main={}; bulkImportDeckList(${JSON.stringify(fs.readFileSync(f,'utf8'))}); const sum=(o)=>Object.values(o).reduce((a,b)=>a+b,0); return 'eggs=' + sum(deckState.eggs) + ' main=' + sum(deckState.main) + ' toast=' + document.getElementById('toast').textContent; })()`);
  console.log(f, r);
}
await browser.close(); console.log(errs);
