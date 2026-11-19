// 似た書き方の見直し(2026-11-19): 「「X」以外の「Y」を含む」「白以外の」「デジタマカード以外の」/ 「さらに、」のあとの動き / 名称の異なるテイマー3体
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
o.ex = await ev(`(() => { const all=[...cardIndexByNumber.values()]; const by=n=>all.find(c=>c.name===n);
  const R=(c,cond)=>String(revealCondMatches(c,cond));
  const wT=all.find(c=>c.category==='tamer'&&c.color.includes('white')), rT=all.find(c=>c.category==='tamer'&&c.color.length===1&&c.color[0]==='red');
  return [R(by('ジャスティモン:アクセルアーム'),'「ジャスティモン:クリティカルアーム」以外の「ジャスティモン」を含むカード'), R(by('ジャスティモン:クリティカルアーム'),'「ジャスティモン:クリティカルアーム」以外の「ジャスティモン」を含むカード'),
    R(rT,'白以外のテイマーカード'), R(wT,'白以外のテイマーカード'),
    R({category:'digitama',name:'X',number:'X',color:[],effect:'「ベムモン」'},'デジタマカード以外の「ベムモン」の記述があるカード'), R(by('ベムモン'),'デジタマカード以外の「ベムモン」の記述があるカード')].join(); })()`);
o.ok_ex = o.ex === 'true,false,true,false,false,true';
o.more = await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[{cards:['BT26-095']}];
  return getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT26-095', cardName:'x', field:'effect', lineIndex:0, text:'≪1ドロー≫し、自分の手札1枚を破棄する。さらに、自分のトラッシュから、デジタマカード以外の特徴「ビートブレイク」を持つカード1枚をこのテイマーの下に裏向きで置く。', timing:'x', event:'t'}).map(h=>h.label).join(' / '); })()`);
o.ok_more = /トラッシュから1枚をこのテイマーの下へ/.test(o.more);
o.hero = await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; O.battle=[];
  const hero=[...cardIndexByNumber.values()].filter(c=>c.category==='tamer'&&/ヒーロー/.test((c.type||'')+(c.form||'')+(c.attribute||''))); const hn=[...new Map(hero.map(c=>[c.name,c.number])).values()].slice(0,3);
  const C='Lv.6以上の相手のデジモンがいるか、特徴に「ヒーロー」を持ち、名称の異なる自分のテイマーが3体以上いる';
  P.battle=hn.map(n=>({cards:[n]})); const a=evalEffectCondition(C,null,${pi}); P.battle=[{cards:[hn[0]]},{cards:[hn[0]]},{cards:[hn[1]]}]; const b=evalEffectCondition(C,null,${pi}); return a+','+b; })()`);
o.ok_hero = o.hero === 'true,false';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
