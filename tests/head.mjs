// テスト共通のひな形。リポジトリの直下で http サーバーを立ててから使う(tests/run.sh がやってくれる)。
//   cd <リポジトリ直下> && python3 -m http.server 8765 &
//   node tests/regression/t61.mjs
// index.html は書き換えず、読み込むときにだけ「内部の関数を呼べる窓口(window.__ev)」を差し込む。
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright'); // ESM の import from 'playwright' は解決できないのでこの形
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  .replace('let practiceState = null;', 'let practiceState = null; window.__ev = (code) => eval(code);');
const decks = fs.readFileSync(new URL('./decks.json', import.meta.url), 'utf8');
const W = parseInt(process.env.W || '1280');
export const browser = await chromium.launch();
export const page = await (await browser.newContext({ viewport: { width: W, height: parseInt(process.env.H || '0') || (W < 500 ? 844 : 1000) } })).newPage();
export const errs = [];
page.on('dialog', d => d.accept()); page.on('pageerror', e => errs.push(e.message));
await page.context().addInitScript(() => { localStorage.setItem('digica_gh_token', 'x'); localStorage.setItem('digica_gh_repo', 'a/b'); localStorage.setItem('digica_nickname', 'テスト'); });
await page.route('**/*', r => {
  const u = r.request().url();
  if (/^http:\/\/localhost:\d+\/index\.html/.test(u)) return r.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
  if (u.startsWith('http://localhost')) return r.continue();
  if (u.includes('decks.json')) return r.fulfill({ json: { content: Buffer.from(unescape(encodeURIComponent(decks)), 'binary').toString('base64'), sha: 'x' } });
  return r.abort(); // 外部(カード画像など)は読まない
});
await page.goto('http://localhost:8765/index.html'); await page.waitForTimeout(1200);
await page.click('.tab-btn[data-tab="practice"]'); await page.waitForTimeout(400);
await page.selectOption('#practiceDeckA', 'dA'); await page.selectOption('#practiceDeckB', 'dB');
await page.click('#practiceStartBtn'); await page.click('text=このまま行く'); await page.click('text=このまま行く'); await page.waitForTimeout(300);
await page.click('#practiceNextPhaseBtn', { force: true }); await page.waitForTimeout(300);
export const ev = (code) => page.evaluate(c => window.__ev(c), code);
export const banner = () => page.evaluate(() => { const b = document.getElementById('fieldPickBanner'); return b.hidden ? '(no banner)' : b.innerText.replace(/\s+/g, ' '); });
export const bar = () => page.evaluate(() => { const b = document.getElementById('attackBar'); return b.hidden ? '(no bar)' : document.getElementById('attackBarMsg').innerText + ' || ' + [...document.querySelectorAll('#attackBarActs button')].map(x => x.innerText.replace(/\s+/g, ' ')).join(' / '); });
export const clickBar = (re) => page.evaluate((r) => [...document.querySelectorAll('#attackBarActs button')].find(b => new RegExp(r).test(b.textContent)).click(), re);
export const enq = (text) => ev(`(() => { clearEffectQueue(); enqueueEffects([], [{ownerIndex: practiceState.turn.playerIndex, stackUid: null, lki:true, lkiUid:'x', cardNumber:'BT1-010', cardName:'テスト', field:'effect', lineIndex:0, text:${JSON.stringify(text)}, timing:'登場時', event:'t'}]); renderEffectPanel(); })()`);
export const autoBtns = () => page.evaluate(() => [...document.querySelectorAll('#effectPanel .ep-btn.auto')].map(b => b.textContent));
export const clickAuto = (re) => page.evaluate((r) => [...document.querySelectorAll('#effectPanel .ep-btn.auto')].find(b => new RegExp(r).test(b.textContent)).click(), re);
