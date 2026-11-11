// v0.96.0: トークン(効果文の能力から作る/登録済みのものを使う/相手の場/同じ名称は出さない/エリアを離れたら取り除く)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
// 全カードでトークンの行を読む
o.parsed = await ev(`(() => { const out={n:0, lines:0, noSpec:[]}; currentDb.cards.forEach(c => ['effect','inherited','security_effect'].forEach(f => (c[f]||'').split('\\n').forEach(l => { if (!/トークン/.test(l) || !/登場/.test(l)) return; out.lines++; const r=parseTokenPlays(l); if (r.length) out.n++; else out.noSpec.push(c.number+' '+l.slice(0,70)); }))); return out; })()`);
await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-010'],rested:false}]; O.battle=[]; renderPracticeBoard(); })()`);
const run = (num, line, own) => ev(`(() => { const P=practiceState.players[${pi}]; const hs=getEffectHandlers({ownerIndex:${pi}, stackUid: ensureStackUid(P.battle[0]), cardNumber:'${num}', cardName:'x', field:'effect', lineIndex:0, text:${JSON.stringify(line)}, timing:'登場時', event:'t'}); const h=hs.find(h=>/🪙/.test(h.label)); if(!h) return 'no button: '+hs.map(x=>x.label).join('/'); h.run(); return h.label; })()`);
o.b1 = await run('BT14-018', '【登場時】【進化時】「紅炎のアモン」(デジモン・赤・DP6000・《速攻》)と「蒼雷のウモン」(デジモン・黄・DP6000・《ブロッカー》)のトークン1体ずつを登場させる。');
o.amon = await ev(`(() => { const st=practiceState.players[${pi}].battle.find(s=>(getStackTopCard(s)||{}).name==='紅炎のアモン'); const c=getStackTopCard(st); return {dp:getEffectiveDP(st), color:c.color, rush: hasInnateOrLinkedKeyword(st,'速攻')}; })()`);
o.umonBlocker = await ev(`hasBlockerKeyword(practiceState.players[${pi}].battle.find(s=>(getStackTopCard(s)||{}).name==='蒼雷のウモン'))`);
o.b2 = await run('BT17-059', '【進化時】「ディアボロモン」（デジモン・14コスト・Lv.6・白・究極体・不明・種族不明・DP3000）のトークン2体をコストを支払わずに登場できる。');
o.diabo = await ev(`practiceState.players[${pi}].battle.filter(s=>(getStackTopCard(s)||{}).name==='ディアボロモン').map(s=>[cardEntryNum(s.cards[0]), getEffectiveDP(s), getStackTopCard(s).level])`);
o.b3 = await run('BT21-029', '【お互いのターン】［ターンに1回］相手のデジモンが消滅したときか相手のセキュリティが減ったとき、相手は「石化」（デジモン・白・DP3000・【自分のターン】このデジモンはレストできない。【消滅時】自分のセキュリティを上から1枚破棄する。）トークン1体を登場させる。');
o.oppStone = await ev(`practiceState.players[1-${pi}].battle.map(s=>cardEntryNum(s.cards[0]))`);
o.b4 = await run('BT19-091', '【メイン】「メガログラウモン」（デジモン・赤・DP6000）と「タオモン」（デジモン・黄・DP6000）と「ラピッドモン」（デジモン・緑・DP6000）トークン1体ずつを登場させる。この効果では自分のデジモンと同じ名称のトークンは登場できない。');
o.b4again = await run('BT19-091', '【メイン】「メガログラウモン」（デジモン・赤・DP6000）と「タオモン」（デジモン・黄・DP6000）と「ラピッドモン」（デジモン・緑・DP6000）トークン1体ずつを登場させる。この効果では自分のデジモンと同じ名称のトークンは登場できない。');
o.countAfter = await ev(`practiceState.players[${pi}].battle.length`);
// トラッシュに送ると取り除かれる
await ev(`(() => { const P=practiceState.players[${pi}]; const st=P.battle.find(s=>(getStackTopCard(s)||{}).name==='ディアボロモン'); P.battle.splice(P.battle.indexOf(st),1); P.trash.push(st.cards[0]); renderPracticeBoard(); })()`);
await page.waitForTimeout(200);
o.swept = await ev(`!practiceState.players[${pi}].trash.some(n=>isTokenNumber(cardEntryNum(n)))`);
o.evolveBlock = await ev(`evolveBlockReason(practiceState.players[${pi}].battle.find(s=>(getStackTopCard(s)||{}).name==='紅炎のアモン'), cardIndexByNumber.get('BT1-019'))`);
o.dbToken = await ev(`ensureTokenCard('管狐','デジモン・黄・DP6000・≪ブロッカー≫')`);
o.stored = await ev(`Object.keys(JSON.parse(localStorage.getItem('digica_token_cards')||'{}'))`);
const chk = {
  parsed: o.parsed.n >= 42, b1: /🪙/.test(o.b1), amon: o.amon.dp === 6000 && o.amon.rush, umonBlocker: o.umonBlocker === true,
  diabo: o.diabo.length === 2 && o.diabo[0][1] === 3000, oppStone: o.oppStone.includes('BT24-TOKEN'),
  sameName: o.countAfter === 8, swept: o.swept === true, evolveBlock: /トークン/.test(o.evolveBlock || ''), dbToken: o.dbToken === 'ST22-TOKEN01',
};
const ng = Object.entries(chk).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(chk));
await browser.close(); console.log(ng.length ? ng : errs);
