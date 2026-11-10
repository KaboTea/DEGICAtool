import { page, ev, browser, errs } from '../head.mjs';
const T = async (num, cond) => console.log(num, await ev(`(()=>{const c=cardIndexByNumber.get('${num}'); return c.name+' Lv'+c.level+' DP'+c.dp+' cost'+c.play_cost+' '+(c.color||[])+' ['+c.type+'] -> '+revealCondMatches(c, ${JSON.stringify(cond)});})()`));
const c1='Lv.4以下の、特徴に「CS」を持つか青のデジモンカード';
await T('BT1-019', c1); await T('BT1-030', c1); await T('BT1-010', c1);
const c2='DP4000以下の、特徴に「獣」を含むか特徴に「イリアス」を持つデジモンカード';
await T('BT24-046', c2); await T('BT24-031', c2); await T('BT24-050', c2);
await browser.close(); console.log(errs);
