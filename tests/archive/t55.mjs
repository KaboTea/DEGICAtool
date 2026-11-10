import { page, ev, browser, enq } from '../head.mjs';
const w = (ms=400) => page.waitForTimeout(ms);
const me='practiceState.players[practiceState.viewingIndex]';
const check = async (label) => {
  const r = await page.evaluate(() => {
    const t = document.getElementById('lsDockToggle');
    const rc = t.getBoundingClientRect();
    const cx = rc.left + rc.width/2, cy = rc.top + rc.height/2;
    const hit = document.elementFromPoint(cx, cy);
    let cb = t.parentElement, chain=[];
    for (let e=t.parentElement; e && e!==document.body; e=e.parentElement) { const cs=getComputedStyle(e); if (cs.transform!=='none'||cs.filter!=='none'||cs.backdropFilter!=='none'&&cs.backdropFilter||cs.contain!=='none'||cs.willChange!=='auto') chain.push((e.id||e.className).toString().slice(0,30)+':'+[cs.transform!=='none'?'tf':'',cs.filter!=='none'?'flt':'',(cs.backdropFilter&&cs.backdropFilter!=='none')?'bdf':'',cs.contain!=='none'?'ct':'',cs.willChange!=='auto'?'wc':''].join('')); }
    return `open=${document.body.classList.contains('ls-dock-open')} hidden=${t.hidden} disp=${getComputedStyle(t).display} rect=${Math.round(rc.left)},${Math.round(rc.top)},${Math.round(rc.width)}x${Math.round(rc.height)} hit=${hit===t?'self':(hit?(hit.id||hit.className).toString().slice(0,40):'none')} cb=[${chain.join(' ')}]`;
  });
  console.log(label.padEnd(14), r);
};
await ev(`(() => { practiceState.turn.phase='main'; practiceState.turn.playerIndex=practiceState.viewingIndex; ${me}.battle=[{cards:['BT1-010'],rested:false}]; ${me}.hand=['BT1-010','BT1-090']; renderPracticeBoard(); })()`); await w(2500);
await check('idle closed');
await page.evaluate(()=>document.getElementById('lsDockToggle').click()); await w();
await check('idle open');
await enq('【登場時】≪1ドロー≫。'); await w(); await check('effect');
await ev('clearEffectQueue(); renderEffectPanel();'); await w();
await ev(`resolveDestructionQueue([${me}.battle[0]], ()=>{}, {})`); await w(); await check('destroy bar');
await page.evaluate(()=>[...document.querySelectorAll('#attackBarActs button')][0]?.click()); await w();
await ev(`startFieldPick({title:'test', candidates:[], max:1, onDone:()=>{}, onCancel:()=>{}})`); await w(); await check('fieldpick');
await ev(`cancelTargetModes && cancelTargetModes(); fieldPickMode=null; renderPracticeBoard();`).catch(()=>{}); await w();
await ev(`openDecisionUi('テスト', [{label:'A', onClick:()=>{}},{label:'B', onClick:()=>{}}])`); await w(); await check('decision');
await page.evaluate(()=>[...document.querySelectorAll('#attackBarActs button')][0]?.click()); await w();
await ev(`appearFromHand(1, 'BT1-090')`); await w(); await check('route modal');
await ev('evolveRouteModal.classList.remove("open")'); await w();
await ev(`openZonePopup(centerPoint(), 'popup', [{label:'x', onClick:()=>{}}])`); await w(); await check('zonepopup');
await ev('closeZonePopup()'); await w(); await check('after');
await browser.close();
