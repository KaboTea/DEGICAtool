import { page, ev, browser } from '../head.mjs';
await ev(`(() => { practiceState.turn.phase='main'; renderPracticeBoard(); })()`);
await page.waitForTimeout(2500);
await page.screenshot({path:'ver_'+process.env.W+'.png', clip:{x:0,y:0,width:120,height:130}}); await page.evaluate(()=>document.getElementById('lsDockToggle').click()); await page.waitForTimeout(400);
await page.screenshot({path:`dock_${process.env.W}${process.env.ROT?'r':''}.png`});
await page.evaluate(()=>document.getElementById('lsDockToggle').click()); await page.waitForTimeout(300);
console.log('closed open?', await ev(`document.body.classList.contains('ls-dock-open')`));
await browser.close();
