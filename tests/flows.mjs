// The forms, end to end, against a running site (and, for the member parts, a Convex backend with a test member):
// the newsletter (typo catch, success), the Q&A sign-in (same answer for members and strangers), the sign-in link,
// a question, sign-out. Run: node tests/flows.mjs [base] [member-email]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(require.resolve('playwright', { paths: (process.env.NODE_PATH || '').split(':').concat('/opt/node-tools/node_modules') })); }
const base = process.argv[2] || 'http://localhost:3005';
const member = process.argv[3] || 'member@example.com';
const log = process.env.NEXT_LOG; // the server's log, where the sign-in link is printed while RESEND_API_KEY is empty

const b = await pw.chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) process.exitCode = 1; };

await p.goto(base + '/', { waitUntil: 'networkidle' });
await p.fill('.hero__form input[type=email]', 'reader@gmial.com');
await p.click('.hero__form button[type=submit]');
await p.waitForSelector('.hero__form .nl-err');
ok((await p.textContent('.hero__form .nl-err')).includes('gmail.com'), 'newsletter: suggests gmail.com for gmial.com');
await p.fill('.hero__form input[type=email]', 'reader@gmail.com');
await p.click('.hero__form button[type=submit]');
await p.waitForSelector('.hero__form .nl-done');
ok(true, 'newsletter: subscribed, the cheering cat shows');

await p.goto(base + '/live', { waitUntil: 'networkidle' });
await p.fill('#qa-email', 'stranger@example.com');
await p.click('form button[type=submit]');
await p.waitForSelector('.nl-done');
const a1 = await p.textContent('.nl-done span');
await p.goto(base + '/live', { waitUntil: 'networkidle' });
await p.fill('#qa-email', member);
await p.click('form button[type=submit]');
await p.waitForSelector('.nl-done');
const a2 = await p.textContent('.nl-done span');
ok(a1.replace('stranger@example.com', '') === a2.replace(member, ''), 'q&a: a stranger and a member get the same answer');

if (log && fs.existsSync(log)) {
  await new Promise((r) => setTimeout(r, 500));
  const m = [...fs.readFileSync(log, 'utf8').matchAll(/sign-in link for (\S+): (\S+)/g)].pop();
  ok(m && m[1] === member, 'q&a: a sign-in link went to the member only');
  if (m) {
    await p.goto(m[2].replace(/^https?:\/\/[^/]+/, base), { waitUntil: 'networkidle' });
    ok((await p.textContent('h2#portal'))?.includes('members'), 'q&a: the link opens the members’ page');
    ok(Boolean(await p.$('a[href^="https://zoom.us"]')), 'q&a: the join link shows');
    await p.fill('#q', 'Can I do my Kegels while I drive to work?');
    await p.click('.qform button[type=submit]');
    await p.waitForSelector('.qform [role=status]');
    ok(true, 'q&a: a question is sent');
    await p.goto(m[2].replace(/^https?:\/\/[^/]+/, base), { waitUntil: 'networkidle' });
    ok(p.url().includes('link=expired'), 'q&a: the same link works once');
  }
}
ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
await b.close();
