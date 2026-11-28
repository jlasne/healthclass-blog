// Copies the brand kit's text and tokens from the master (jlasne/healthclass, folder brand/) into ./brand.
// Run: node scripts/sync-brand.mjs ../healthclass/brand
// Images stay out: the logo, the cats and the photos already live in public/. This repo is public, so only 3 files are copied.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.resolve(process.argv[2] || path.join(root, '..', 'healthclass', 'brand'));
const to = path.join(root, 'brand');
if (!fs.existsSync(path.join(from, 'tokens.json'))) {
  console.error(`No brand kit found at ${from}. Pass the path to jlasne/healthclass/brand.`);
  process.exit(1);
}

// This repo is public. Only the files that are safe to publish are copied: the tokens, the visual rules and the voice rules.
// Decisions, channels, playbooks, chat summaries, open questions and numbers stay in the private master.
const PUBLIC = ['tokens.json', 'VISUAL.md', 'VOICE.md'];
let n = 0;
for (const f of PUBLIC) {
  fs.copyFileSync(path.join(from, f), path.join(to, f));
  n++;
}

const note = path.join(to, 'SYNCED.md');
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(note, `# This folder is a partial, public copy

This repo is public. The full brand kit (decisions, channels, playbooks, chat summaries, open questions, numbers) is private,
in \`jlasne/healthclass\`, folder \`brand/\`. Only 3 files are copied here: \`tokens.json\`, \`VISUAL.md\`, \`VOICE.md\`.
Edit them in the private master, then run \`npm run brand:sync\` here. \`npm run brand:check\` compares the site colors with \`tokens.json\`.
Never copy decisions, numbers, inbox details, partner or reader information into this repo.
Last synced: ${today}.
`);
console.log(`Synced ${n} files from ${from}.`);
