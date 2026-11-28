// Brand drift check for the website: compares the colors in app/globals.css with brand/tokens.json.
// Run: npm run brand:check   (exit code 1 when something differs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(fs.readFileSync(path.join(root, 'brand', 'tokens.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
const long = (h) => (/^#[0-9a-f]{3}$/i.test(h) ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h).toUpperCase();

let bad = 0;
for (const [name, t] of Object.entries(tokens.color)) {
  if (!t.site) continue;
  const m = new RegExp(t.site.replace(/-/g, '\\-') + '\\s*:\\s*(#[0-9a-fA-F]{3,6})\\b').exec(css);
  if (!m) { console.log(`MISSING  ${name}: ${t.site} is not in globals.css`); bad++; continue; }
  if (long(m[1]) !== long(t.hex)) { console.log(`DIFFERS  ${name}: ${t.site} is ${m[1]} in globals.css, ${t.hex} in tokens.json`); bad++; }
}
console.log(bad ? `${bad} difference(s).` : 'The site colors match brand/tokens.json.');
process.exit(bad ? 1 : 0);
