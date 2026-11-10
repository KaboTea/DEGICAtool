import { page, ev, errs, browser } from '../head.mjs';
const c = '「城木明日奈」1枚かLv.4以下の、「三銃士」の記述があるか特徴に「TS」を持つデジモンカード';
console.log(await ev(`(() => { const all=[...cardIndexByNumber.values()].filter(x=>x.category==='digimon' && (/TS/.test(x.type||'') || /三銃士/.test(x.effect||'')+ /三銃士/.test(x.inherited||''))); return all.slice(0,40).map(x=>x.number+' '+x.name+' Lv'+x.level+' ['+(x.type||'')+'] '+revealCondMatches(x, ${JSON.stringify(c)})).join('\\n'); })()`));
console.log(await ev(`revealCondMatches(cardIndexByNumber.get('BT24-088'), ${JSON.stringify(c)})`));
await browser.close(); console.log(errs);
