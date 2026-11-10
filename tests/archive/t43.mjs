import { page, ev, errs, browser } from '../head.mjs';
const me='practiceState.players[practiceState.viewingIndex]';
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; renderPracticeBoard(); })()`);
console.log(await ev(`(() => {
  const reP = /^(?:(.+?)間、)?(?:手札の)?このカード(?:が(?:手札から)?登場する|を登場させる|を使用する)とき、(?:(.+?)なら、)?(?:(.+?)ごとに、?)?支払う(?:登場|使用)?コスト[-－](\\d+)/;
  let tot=0, parsed=0; const nulls=[], noparse=[];
  [...cardIndexByNumber.values()].forEach(c => (c.effect||'').split('\\n').forEach(line => {
    const body = engineStripNotes(line).replace(/^(【[^】]+】|［[^］]*］|\\[[^\\]]*\\]|\\{[^}]*\\})+/, '');
    if (!/このカード[^。]*(登場|使用)[^。]*とき、[^。]*支払う[^。]*コスト[-－]/.test(body) || /この効果で|ことで/.test(body)) return;
    tot++; const m = reP.exec(body); if (!m) { noparse.push(c.number+' '+body.slice(0,60)); return; } parsed++;
    const cond = m[1]||m[2]; if (cond && evalFieldCondition(cond, practiceState.viewingIndex) == null) nulls.push(c.number+' '+cond);
  }));
  return tot+' parsed '+parsed+'\\nNOPARSE\\n'+noparse.join('\\n')+'\\nNULL('+nulls.length+')\\n'+nulls.join('\\n');
})()`));
await browser.close(); console.log(errs);
