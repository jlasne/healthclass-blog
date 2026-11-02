// Health Class blog · the launch check. Fails (exit 1) on what must be fixed before launch, warns on what can wait.
// Run: npm run check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fails = [], warns = [];

// 1. legal placeholders: the stores need complete policies
for (const f of ['lib/legal.ts', 'app/privacy/page.tsx', 'app/terms/page.tsx']) {
  const hits = [...read(f).matchAll(/\[([A-Za-z][A-Za-z ,.()'-]{6,80})\]/g)].map((m) => m[1]).filter((t) => t.includes(' '));
  hits.forEach((h) => fails.push(`${f}: fill [${h}]`));
}

// 2. every letter approved by Dr. Dana (reviewed: true in its front matter), and the copy rules
const dir = path.join(root, 'content/articles');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  if (!/^reviewed:\s*true/m.test(raw)) fails.push(`content/articles/${f}: Dr. Dana has not approved it yet (set reviewed: true)`);
  if (/[—–]/.test(raw)) fails.push(`content/articles/${f}: an em or en dash (use a period, a colon or a comma)`);
  const body = raw.split('---').slice(2).join('---').replace(/<[A-Z][\s\S]*?\/>/g, '').replace(/<[^>]+>/g, '').replace(/\*\*/g, '');
  body.split(/(?<=[.!?])\s+/).forEach((s) => { const n = s.split(/\s+/).filter(Boolean).length; if (n > 30) warns.push(`content/articles/${f}: ${n} words in "${s.slice(0, 60).replace(/\n/g, ' ')}..."`); });
  for (const m of raw.matchAll(/url:\s*"([^"]+)"/g)) if (!/^https:\/\//.test(m[1])) fails.push(`content/articles/${f}: source URL is not https: ${m[1]}`);
}

// 3. the store links and the copy Dr. Dana signs
const site = read('lib/site.ts');
if (/appStoreUrl:\s*''/.test(site)) warns.push('lib/site.ts: appStoreUrl is empty (buttons say "Coming soon"; healthclass.app sends iPhones to /app)');
if (/playStoreUrl:\s*''/.test(site)) warns.push('lib/site.ts: playStoreUrl is empty (same for Android)');
if (/podcasts:\s*\[\]/.test(site)) warns.push('lib/site.ts: no podcast episodes yet (the About page shows "on the way")');
warns.push('Dr. Dana to approve: "Why I made this class" on /dana, and her credentials in lib/site.ts');

// 4. the environment (Vercel and Convex)
const env = { ...process.env };
if (fs.existsSync(path.join(root, '.env.local'))) read('.env.local').split('\n').forEach((l) => { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m && !env[m[1]]) env[m[1]] = m[2]; });
if (!env.NEXT_PUBLIC_CONVEX_URL && !env.CONVEX_URL) warns.push('CONVEX_URL is empty: forms answer "you are in" but store nothing');
if (!env.HC_SERVER_SECRET) warns.push('HC_SERVER_SECRET is empty: the forms cannot reach Convex');
if (!env.RESEND_API_KEY) warns.push('RESEND_API_KEY is empty: Q&A sign-in links are only written to the server log');
warns.push('On Convex (npx convex env set): HC_SERVER_SECRET, MAILCHEAP_API_KEY, SUPERWALL_WEBHOOK_KEY, HC_ADMIN_TOKEN');

warns.forEach((w) => console.log(`warn  ${w}`));
fails.forEach((f) => console.log(`FAIL  ${f}`));
console.log(fails.length ? `\n${fails.length} to fix before launch.` : '\nReady to launch.');
process.exit(fails.length ? 1 : 0);
