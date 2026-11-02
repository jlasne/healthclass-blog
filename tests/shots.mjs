// Screenshots of every page at phone and desktop widths, and a fail on any console error.
// Run with the site up: node tests/shots.mjs [base] [paths...]
import { createRequire } from 'node:module';
// Playwright comes from the machine (or `npm i -D playwright`): resolved the way require() finds it
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(require.resolve('playwright', { paths: (process.env.NODE_PATH || '').split(':').concat('/opt/node-tools/node_modules') })); }
const { chromium } = pw;
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:3005';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];
const out = new URL('./screens/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
let errors = 0;
for (const [name, vp] of [['desktop', { width: 1366, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: name === 'phone' ? 2 : 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log(`[${name}] console error on ${page.url()}: ${m.text()}`); } });
  page.on('pageerror', (e) => { errors++; console.log(`[${name}] page error on ${page.url()}: ${e.message}`); });
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // scroll through so every reveal and sketch runs
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); document.querySelectorAll('[data-rise],.sketch').forEach((e) => e.classList.add('is-in')); });
    await page.waitForTimeout(1300);
    const file = `${out}${name}${p === '/' ? '-home' : p.replace(/[^a-z0-9]+/gi, '-')}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log('shot', file);
  }
  await ctx.close();
}
await browser.close();
if (errors) { console.log(`${errors} console errors`); process.exit(1); }
