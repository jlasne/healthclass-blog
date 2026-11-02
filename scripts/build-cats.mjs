// Health Class blog · the class cat, rendered once per pose into public/cats/<pose>.svg.
// The drawings come from the app (vendor/ink.js is a copy of www/js/ink.js in jlasne/healthclass). Each file holds the
// 6 hand-drawn frames and its own CSS, so the cat animates even as a plain <img>: the frames swap 7 times a second,
// and under reduced motion the first frame stays. It also writes lib/cats.json (each pose's width and height).
// Run: node scripts/build-cats.mjs (npm run build runs it first).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {}, Math, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/ink.js'), 'utf8'), ctx);
// the website's own poses, drawn with the same engine and parts
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/ink-blog.js'), 'utf8'), ctx);
const ink = ctx.window.HCInk;
if (!ink) throw new Error('vendor/ink.js did not define HCInk');

const FRAME_MS = 143;
const LOOP_MS = FRAME_MS * ink.frames;
const style =
  '<style>' +
  '.ink__f{visibility:hidden}.ink__f:first-child{visibility:visible}' +
  '@keyframes hcf{0%{visibility:visible}16.667%,100%{visibility:hidden}}' +
  `@media (prefers-reduced-motion:no-preference){.ink__f{animation:hcf ${LOOP_MS}ms step-end infinite}}` +
  '</style>';

const outDir = path.join(root, 'public/cats');
fs.mkdirSync(outDir, { recursive: true });
const sizes = {};
for (const name of ink.names()) {
  let svg = ink.svg(name, { size: 240 });
  // frame i shows during its sixth of the loop: a negative delay starts it there
  svg = svg.replace(/<g class="ink__f" style="--i:(\d)">/g, (_, i) => `<g class="ink__f" style="animation-delay:${(+i - ink.frames) * FRAME_MS}ms">`);
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1${style}`);
  const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  sizes[name] = { w: +m[1], h: +m[2] };
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
  // a still (frame 1 only, no CSS) for places that cannot animate: share images, email
  const still = ink.svg(name, { size: 240 }).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/<g class="ink__f" style="--i:[1-5]">.*?<\/g>(?=<g|<\/svg>)/g, '');
  fs.mkdirSync(path.join(outDir, 'still'), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'still', `${name}.svg`), still);
}

// the logo: "HC" and the curved bar, rose on paper
const logo = ink.logo({ label: 'Health Class' })
  .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
  .replace('class="hc-lg__hc"', 'fill="#B93D57"')
  .replace('class="hc-lg__bar"', 'fill="none" stroke="#D9566F" stroke-width="4.6" stroke-linecap="round"');
fs.writeFileSync(path.join(root, 'public/logo.svg'), logo);

// the icons: white "HC" on rose, like the app icon (favicon, home screen, search results, the organization logo)
const mark = (size, pad, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
  `<rect width="${size}" height="${size}" rx="${radius}" fill="#D9566F"/>` +
  `<svg x="${pad}" y="${pad}" width="${size - 2 * pad}" height="${size - 2 * pad}" viewBox="20 22 60 60"><path d="${ink.LOGO_HC}" fill="#fff"/><path d="${ink.LOGO_BAR}" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round"/></svg></svg>`;
fs.writeFileSync(path.join(root, 'app/icon.svg'), mark(64, 6, 14));
await sharp(Buffer.from(mark(512, 56, 0))).png().toFile(path.join(root, 'public/icon.png'));
await sharp(Buffer.from(mark(180, 20, 0))).png().toFile(path.join(root, 'app/apple-icon.png'));
await sharp(Buffer.from(mark(192, 22, 0))).png().toFile(path.join(root, 'public/icon-192.png'));
await sharp(Buffer.from(mark(512, 80, 0))).png().toFile(path.join(root, 'public/icon-maskable.png'));
fs.writeFileSync(path.join(root, 'lib/cats.json'), JSON.stringify({ sizes, logo: { hc: ink.LOGO_HC, bar: ink.LOGO_BAR } }, null, 2) + '\n');
console.log(`cats: ${Object.keys(sizes).length} poses written to public/cats/`);
