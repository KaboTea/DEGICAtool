// v0.92.1: 「名称に「A」か「B」を含む自分のデジモン」の判定 / 育成エリアのデジタマも≪使用条件≫・色条件・「エリアに〜」で数える
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const v = await ev('practiceState.viewingIndex');
const r = await ev(`(() => { const out={}; const all=currentDb.cards; const P=practiceState.players[${v}];
 const gm=all.find(c=>c.category==='digimon'&&/^ブリッツグレイモン$/.test(c.name)) || all.find(c=>c.category==='digimon'&&/グレイモン/.test(c.name)&&!/アグモン/.test(c.name));
 P.battle=[{cards:[gm.number],rested:false}]; P.raising=null;
 out.A=evalEffectCondition('名称に「アグモン」か「グレイモン」を含む自分のデジモンがいる', null, ${v}) === true;
 P.battle=[]; out.A0=evalEffectCondition('名称に「アグモン」か「グレイモン」を含む自分のデジモンがいる', null, ${v}) === false;
 P.raising={cards:['BT25-002'],rested:false};
 out.B=optionColorCheck(cardIndexByNumber.get('ST24-15'), ${v}).ignore === true;
 out.C=evalEffectCondition('エリアに特徴「セイバーズ」を持つ自分のデジモンがいる', null, ${v}) === true;
 out.D=evalEffectCondition('特徴「セイバーズ」を持つ自分のデジモンがいる', null, ${v}) === false;
 return out; })()`);
const ng = Object.entries(r).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(r));
await browser.close(); console.log(ng.length ? ng : errs);
