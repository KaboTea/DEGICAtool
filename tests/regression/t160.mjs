// v0.96.2: 効果で登場させた後の条件(レスト状態/【登場時】効果を発揮しない/進化できず(ずっと)/≪速攻≫を得る/同じ名称)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const clickEffRoute = async () => { await page.waitForTimeout(250); await page.evaluate(() => { const b=[...document.querySelectorAll('#evolveRouteModal button')].find(x=>/効果で登場/.test(x.textContent)); b.click(); }); await page.waitForTimeout(300); };
const play = async (num, text, zone) => {
  await ev(`(() => { const P=practiceState.players[${pi}]; P.${zone}.push('${num}'); appearFromHand(P.${zone}.length-1, '${num}', centerPoint(), false, { costRule:{type:'free'}, source:'${zone}', effectName:'テスト', effectText:${JSON.stringify(text)} }); })()`);
  await clickEffRoute();
  return ev(`(() => { const P=practiceState.players[${pi}]; const st=P.battle[P.battle.length-1]; return { top: cardEntryNum(st.cards[0]), rested: st.rested, locks: Object.keys(st.locks||{}), perm: Object.keys(st.permLocks||{}), rush: (st.kwGrants||[]).some(g=>g.label==='速攻') && KEYWORD_TOGGLE_DEFS.find(d=>d.label==='速攻').has(st), queue: getEffectQueue().pending.concat(getEffectQueue().current?[getEffectQueue().current]:[]).filter(x=>x.timing==='登場時' && x.stackUid===st.uid).length }; })()`);
};
await ev(`(() => { const P=practiceState.players[${pi}]; P.battle=[]; renderPracticeBoard(); })()`);
o.noPlayEffect = await play('BT1-010', '【登場時】自分のトラッシュから、紫のLv.4以下のデジモンカード2枚までをコストを支払わずに登場できる。この効果で登場したデジモンの【登場時】効果は発揮しない。', 'trash');
o.noEvolve = await play('BT1-019', '【アタック時】自分の手札から、特徴に「フーディエ」を持つ登場コスト5以下のデジモンカード1枚をコストを支払わずに登場できる。この効果で登場したデジモンは進化できず、相手のターン終了時、消滅する。', 'hand');
o.rested = await play('BT1-025', '【アタック時】相手は相手のトラッシュから、Lv.4以下のデジモンカード1枚をコストを支払わずにレスト状態で登場させる。', 'trash');
o.rush = await play('BT1-010', '・育成エリアの自分のデジモンの進化元の特徴に「ロイヤルナイツ」を持つカード1枚をコストを支払わずに登場させる。この効果で登場したデジモンの【登場時】効果は発揮せず、このターンの間、≪速攻≫を得る。', 'hand');
o.sameKinds = await ev(`effectNoSameNameKinds('【進化時】【アタック時】「アト&ルネ&ポル」トークン1体か、自分の手札/トラッシュから、名称に「シスタモン」を含むデジモンカード1枚をコストを支払わずに登場できる。この効果では、自分のデジモンと同じ名称のカードは登場できない。')`);
o.sameOnField = await ev(`sameNameOnField(${pi}, cardIndexByNumber.get('BT1-010'), ['digimon'])`);
// ターン終了でロックが外れても「進化できない」は残る
await ev(`(() => { const st=practiceState.players[${pi}].battle[1]; st.locks = st.permLocks ? Object.assign({}, st.permLocks) : {}; })()`);
o.permKept = await ev(`hasLock(practiceState.players[${pi}].battle[1], 'noEvolve')`);
const chk = {
  noPlayEffect: o.noPlayEffect.locks.includes('noPlayEffect') && o.noPlayEffect.queue === 0,
  noEvolve: o.noEvolve.perm.includes('noEvolve'), rested: o.rested.rested === true,
  rush: o.rush.rush === true && o.rush.locks.includes('noPlayEffect'),
  sameKinds: JSON.stringify(o.sameKinds) === '["digimon"]', sameOnField: o.sameOnField === true, permKept: o.permKept === true,
};
const ng = Object.entries(chk).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(chk));
await browser.close(); console.log(ng.length ? ng : errs);
