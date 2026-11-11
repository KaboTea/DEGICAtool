// v0.96.5: アプ合体の組み合わせ判定(〔アプ合体〕に書かれた名前のうち別々の2種: 一番上+リンクカード)
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1200);
const r = await ev(`(() => { const by=(n)=>[...cardIndexByNumber.values()].find(c=>c.name===n && c.category==='digimon').number;
 const card=cardIndexByNumber.get('BT21-018');
 return { ok1: appFusionComboCheck(card, {cards:[by('ガッチモン')], links:[by('ナビモン')]}).ok === true,
  ok2: appFusionComboCheck(card, {cards:[by('ナビモン')], links:[by('ツブモン')]}).ok === true,
  sameName: appFusionComboCheck(card, {cards:[by('ガッチモン')], links:[by('ガッチモン')]}).ok === false,
  wrongTop: appFusionComboCheck(card, {cards:['BT1-010'], links:[by('ナビモン')]}).ok === false,
  noRule: appFusionComboCheck(cardIndexByNumber.get('BT1-010'), {cards:['BT1-010'], links:[]}).ok === null }; })()`);
const ng = Object.entries(r).filter(([k, x]) => x !== true).map(([k]) => k);
console.log(JSON.stringify(r));
await browser.close(); console.log(ng.length ? ng : errs);
