import { page, ev, errs, browser } from '../head.mjs';
const r = await ev(`(() => {
  const nums = ['BT16-053','P-203','ST17-08','BT20-037','BT3-105','EX12-026','BT19-073','BT25-072','EX7-049','BT1-113','BT24-040','BT23-094','BT18-025','EX3-053','BT13-075','BT19-038','BT19-037'];
  return nums.map(n => { const c = cardIndexByNumber.get(n); const t = [c.effect, c.inherited, c.security_effect].filter(Boolean).join(String.fromCharCode(10));
    const acts = t.split(String.fromCharCode(10)).flatMap(l => parseTargetActions(l)).filter(a => a.action.locks).map(a => a.phrase + '→' + a.action.type + ':' + a.action.locks.join('/') + ' [' + a.duration + ']');
    return n + ' ' + (acts.join(' ; ') || '(なし)'); });
})()`);
console.log(r.join('\n')); console.log('errs', errs); await browser.close();
