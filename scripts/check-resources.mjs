// Health Class blog · the resources check. Run before every publish: npm run check:resources
// Fails (exit 1) on what would hurt a reader, Google or the site's rules; warns on what can wait.
// What it checks, per page in content/resources/<family>/<slug>.mdx:
//   the front matter a template needs, the copy rules (no em or en dashes, under 30 words a sentence), https sources,
//   links that land on real pages, the honesty rule on comparisons (2 or more points where the other side wins),
//   no "Reviewed by Dr. Dana" without her review, and one page per search title.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'content/resources');
const FAMILIES = ['tools', 'compare', 'classes', 'made-for-you'];
const TOOLS = ['leak-type-quiz'];
const TONES = ['rosy', 'plum', 'blush', 'sky'];
const cats = JSON.parse(fs.readFileSync(path.join(root, 'lib/cats.json'), 'utf8'));
// the app facts pages can show as {app.key} (lib/app-facts.ts)
const facts = new Set([...fs.readFileSync(path.join(root, 'lib/app-facts.ts'), 'utf8').matchAll(/^\s{2}([a-zA-Z]+): /gm)].map((m) => m[1]));
const letters = new Set(fs.readdirSync(path.join(root, 'content/articles')).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '')));
const fails = [], warns = [];
const pages = [];

for (const fam of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
  if (!fs.statSync(path.join(dir, fam)).isDirectory()) continue;
  if (!FAMILIES.includes(fam)) { fails.push(`content/resources/${fam}: unknown family (use ${FAMILIES.join(', ')})`); continue; }
  for (const f of fs.readdirSync(path.join(dir, fam)).filter((x) => x.endsWith('.mdx'))) {
    const file = `content/resources/${fam}/${f}`;
    const raw = fs.readFileSync(path.join(root, file), 'utf8');
    const { data, content } = matter(raw);
    pages.push({ fam, slug: f.replace(/\.mdx$/, ''), file, data, content, raw });
  }
}
const known = new Set(pages.map((p) => `${p.fam}/${p.slug}`));
const dateOf = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ''));
const seo = new Map();

for (const p of pages) {
  const { file, data, content, raw, fam, slug } = p;
  const need = (k, v = data[k]) => { if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) fails.push(`${file}: missing ${k}`); };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fails.push(`${file}: the file name must be lowercase words joined by hyphens`);
  ['title', 'seoTitle', 'description', 'excerpt', 'answer', 'date', 'updated', 'keywords', 'sources', 'faq'].forEach((k) => need(k));
  need('cta.title', data.cta?.title);
  if (data.description && String(data.description).length > 160) fails.push(`${file}: description is ${String(data.description).length} characters (160 at most)`);
  if (data.seoTitle && String(data.seoTitle).length > 70) warns.push(`${file}: seoTitle is ${String(data.seoTitle).length} characters (Google shows about 60)`);
  if (dateOf(data.updated) < dateOf(data.date)) fails.push(`${file}: updated is before date`);
  if (data.tone && !TONES.includes(data.tone)) fails.push(`${file}: tone must be one of ${TONES.join(', ')}`);
  if (data.cat && !cats.sizes[data.cat]) fails.push(`${file}: no cat pose "${data.cat}" (poses: ${Object.keys(cats.sizes).join(', ')})`);
  for (const m of raw.matchAll(/\{app\.([a-zA-Z]+)\}/g)) if (!facts.has(m[1])) fails.push(`${file}: {app.${m[1]}} is not in lib/app-facts.ts`);
  if (fam === 'compare' && !/\{app\.[a-zA-Z]+\}/.test(raw)) fails.push(`${file}: a comparison shows Health Class facts as {app.price}, {app.phones}... (lib/app-facts.ts), so they follow the app`);
  if (/[—–]/.test(raw)) fails.push(`${file}: an em or en dash (use a period, a colon or a comma)`);
  if (/reviewed by dr|reviewed by dana|medically reviewed/i.test(raw)) fails.push(`${file}: says Dr. Dana reviewed it. Only with her written OK.`);
  for (const s of data.sources ?? []) if (!/^https:\/\//.test(s.url ?? '')) fails.push(`${file}: source URL is not https: ${s.url}`);
  const refs = [...content.matchAll(/<Ref n=\{(\d+)\}/g)].map((m) => Number(m[1]));
  for (const n of refs) if (n < 1 || n > (data.sources ?? []).length) fails.push(`${file}: <Ref n={${n}} /> has no source ${n}`);
  if ((data.links ?? []).length > 5) fails.push(`${file}: ${data.links.length} links (5 at most, so every one shows under the page)`);
  for (const l of data.links ?? []) if (!known.has(l)) warns.push(`${file}: links to ${l}, not written yet (skipped on the page until it exists)`);
  for (const l of data.letters ?? []) if (!letters.has(l)) fails.push(`${file}: no letter "${l}" in content/articles`);
  for (const m of content.matchAll(/\]\((\/[^)\s#]*)/g)) {
    const href = m[1];
    const r = href.match(/^\/resources\/([a-z-]+)\/([a-z0-9-]+)$/);
    const l = href.match(/^\/letters\/([a-z0-9-]+)$/);
    if (r && !known.has(`${r[1]}/${r[2]}`)) fails.push(`${file}: link to ${href}, no such page`);
    if (l && !letters.has(l[1])) fails.push(`${file}: link to ${href}, no such letter`);
  }
  const text = [content, data.answer, data.excerpt, ...(data.faq ?? []).map((q) => q.a)].join(' ').replace(/<[A-Z][\s\S]*?\/>/g, '').replace(/<[^>]+>/g, '').replace(/[*_#>]/g, '').replace(/\]\([^)]*\)/g, ']');
  text.split(/(?<=[.!?])\s+/).forEach((s) => { const n = s.split(/\s+/).filter(Boolean).length; if (n > 30) warns.push(`${file}: ${n} words in "${s.slice(0, 60).replace(/\n/g, ' ')}..."`); });
  const key = String(data.seoTitle ?? '').toLowerCase();
  if (seo.has(key)) fails.push(`${file}: same seoTitle as ${seo.get(key)} (one page per search)`); else seo.set(key, file);
  if (fam === 'tools') { need('tool'); if (data.tool && !TOOLS.includes(data.tool)) fails.push(`${file}: no tool "${data.tool}" in components/tools`); }
  if (fam === 'compare' && data.sides) {
    // 3 sides or more: sides, rows (one value per side), winsBy (every side, 2 points or more), pickBy
    const n = data.sides.length;
    if (n < 2) fails.push(`${file}: sides needs 2 or more`);
    for (const x of data.sides) { if (!x.name) fails.push(`${file}: a side has no name`); if (x.name !== 'Health Class' && !x.checked) fails.push(`${file}: ${x.name} needs checked (the date you checked its facts)`); }
    need('rows');
    for (const row of data.rows ?? []) if ((row.values ?? []).length !== n) fails.push(`${file}: row "${row.label}" needs ${n} values, one per side`);
    for (const x of data.sides) if (!(data.winsBy ?? []).some((w) => w.name === x.name && (w.points ?? []).length >= 2)) fails.push(`${file}: winsBy needs 2 or more points for ${x.name} (the honesty rule)`);
    need('pickBy');
  } else if (fam === 'compare') {
    need('rival.name', data.rival?.name); need('rival.url', data.rival?.url); need('rival.checked', data.rival?.checked); need('table');
    if ((data.wins?.them ?? []).length < 2) fails.push(`${file}: list 2 or more points where ${data.rival?.name ?? 'the other side'} wins (the honesty rule)`);
    if ((data.wins?.us ?? []).length < 2) fails.push(`${file}: list 2 or more points where Health Class wins`);
    need('pick.them', data.pick?.them); need('pick.us', data.pick?.us);
  }
  if (fam === 'classes') { need('weeks'); need('status'); }
  if (fam === 'made-for-you') { need('goal'); need('fit'); if (data.fit && !known.has(data.fit)) warns.push(`${file}: fit ${data.fit} is not written yet`); }
}

warns.forEach((w) => console.log(`warn  ${w}`));
fails.forEach((f) => console.log(`FAIL  ${f}`));
console.log(`\n${pages.length} resource pages. ${fails.length ? `${fails.length} to fix.` : 'All good.'}`);
process.exit(fails.length ? 1 : 0);
