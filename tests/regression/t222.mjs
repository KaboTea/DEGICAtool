// BT27-083「相手は自身の手札/セキュリティを選んで1枚破棄する」: 手札とセキュリティを1つの一覧に。裏向きのセキュリティは名前を出さない
import { page, ev, errs, browser } from '../head.mjs';
await page.waitForTimeout(1500);
const o = {};
const pi = await ev('practiceState.turn.playerIndex');
const open = async () => {
  await ev(`(() => { const P=practiceState.players[${pi}], O=practiceState.players[1-${pi}]; P.battle=[{cards:['BT1-009','BT27-083']}]; O.hand=['BT1-010']; O.security=['BT1-015',{n:'BT1-016',u:true},'BT1-015']; O.trash=[]; renderPracticeBoard();
    const h=getEffectHandlers({ownerIndex:${pi}, stackUid:ensureStackUid(P.battle[0]), cardNumber:'BT27-083', cardName:'x', field:'effect', lineIndex:0, text:'相手は自身の手札/セキュリティを選んで1枚破棄する。', timing:'進化時', event:'t'}).find(h=>/手札かセキュリティ/.test(h.label)); h.run(); })()`);
  await page.waitForTimeout(150);
};
await open();
o.rows = await page.evaluate(() => [...document.querySelectorAll('#detailBody .cmp-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()).join(' | '));
o.ok_rows = /手札/.test(o.rows) && /上から1枚目/.test(o.rows) && !/BT1-015|アグモン/.test(o.rows.split(' | ')[1]) && /表向き/.test(o.rows.split(' | ')[2]);
// 上から3枚目(裏向き)を破棄
await page.evaluate(() => { document.querySelectorAll('#detailBody .cmp-row')[3].click(); [...document.querySelectorAll('#detailBody button')].find(x => /破棄する/.test(x.textContent) && !x.disabled).click(); });
await page.waitForTimeout(150);
o.after = await ev(`(() => { const O=practiceState.players[1-${pi}]; return O.hand.length+'/'+O.security.length+' trash='+O.trash.join()+' sec1='+cardEntryNum(O.security[1]); })()`);
o.ok_after = o.after === '1/2 trash=BT1-015 sec1=BT1-016';
const ng = Object.entries(o).filter(([k, x]) => k.startsWith('ok_') && x !== true).map(([k]) => k);
console.log(JSON.stringify(o));
await browser.close(); console.log(ng.length ? ng : errs);
