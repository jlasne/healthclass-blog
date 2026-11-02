// The sketches: small hand-drawn graphs in the cat's ink (rough.js, drawn on the server, seeded so every build draws
// the same lines). Plum ink, rose and sky hatching, Caveat labels, a dotted paper, and one cat watching. Each one
// draws itself in when it reaches the screen (components/Motion.tsx), and carries a text description for screen
// readers and search engines.
import rough from 'roughjs';
import { Cat, type Pose } from './Cat';

type Tone = 'rose' | 'plum' | 'sky' | 'ink' | 'mute';
type El = { d: string; cls: string; w: number; delay: number; fillCls?: string; fill?: string };

const gen = rough.generator();
const r1 = (s: string) => s.replace(/-?\d+\.\d+/g, (n) => (Math.round(+n * 10) / 10).toString());
const HATCH: Record<Tone, string> = { rose: '#D9566F', plum: '#7C2D4B', sky: '#9CC3E6', ink: '#4A2433', mute: '#A3978F' };
const TINT: Record<Tone, string> = { rose: '#F9D5DB', plum: '#EADBE2', sky: '#DCEAF6', ink: '#EADBE2', mute: '#F5EFE7' };

class Pen {
  els: El[] = [];
  texts: React.ReactNode[] = [];
  seed = 1;
  t = 0; // the running delay, in ms
  private push(drawable: ReturnType<typeof gen.line>, cls: string, w: number, delay: number) {
    for (const p of gen.toPaths(drawable)) {
      const isFill = p.stroke === 'none' || (p.fill && p.fill !== 'none');
      if (isFill && p.fill && p.fill !== 'none') this.els.push({ d: r1(p.d), cls: 'sk-solid', w: 0, delay, fillCls: 'solid', fill: p.fill });
      else this.els.push({ d: r1(p.d), cls, w: p.strokeWidth || w, delay });
    }
  }
  line(x1: number, y1: number, x2: number, y2: number, tone: Tone = 'ink', w = 2.2, step = 60) {
    this.push(gen.line(x1, y1, x2, y2, { seed: this.seed++, roughness: 1.1, bowing: 1.4, strokeWidth: w, stroke: HATCH[tone] }), `sk-${tone}`, w, (this.t += step));
  }
  path(pts: [number, number][], tone: Tone = 'ink', w = 2.2, step = 120, curve = true) {
    const d = curve ? gen.curve(pts, { seed: this.seed++, roughness: 0.9, strokeWidth: w, stroke: HATCH[tone] }) : gen.linearPath(pts, { seed: this.seed++, roughness: 1, strokeWidth: w, stroke: HATCH[tone] });
    this.push(d, `sk-${tone}`, w, (this.t += step));
  }
  rect(x: number, y: number, w: number, h: number, fill?: Tone, line: Tone = 'ink', step = 120) {
    if (fill) this.push(gen.rectangle(x, y, w, h, { seed: this.seed++, roughness: 1.2, fill: HATCH[fill], fillStyle: 'hachure', hachureGap: 7, hachureAngle: -41, fillWeight: 1.5, stroke: 'none' }), `sk-${fill} sk-hatch`, 1.5, (this.t += step));
    this.push(gen.rectangle(x, y, w, h, { seed: this.seed++, roughness: 1.2, bowing: 1.5, strokeWidth: 2.2, stroke: HATCH[line] }), `sk-${line}`, 2.2, (this.t += 40));
  }
  // a soft tinted shape under its ink line (for boxes that carry words)
  tint(kind: 'rect' | 'ellipse', a: number, b: number, w: number, h: number, tone: Tone, step = 100) {
    const o = { seed: this.seed++, roughness: 1, fill: TINT[tone], fillStyle: 'solid' as const, stroke: 'none' };
    this.push(kind === 'rect' ? gen.rectangle(a, b, w, h, o) : gen.ellipse(a, b, w, h, o), 'sk-solid', 0, (this.t += step));
    const line = { seed: this.seed++, roughness: 1.2, bowing: 1.5, strokeWidth: 2.2, stroke: HATCH.ink };
    this.push(kind === 'rect' ? gen.rectangle(a, b, w, h, line) : gen.ellipse(a, b, w, h, line), 'sk-ink', 2.2, (this.t += 40));
  }
  ellipse(cx: number, cy: number, w: number, h: number, fill?: Tone, line: Tone = 'ink', step = 120, style: 'hachure' | 'zigzag' | 'cross-hatch' = 'hachure') {
    if (fill) this.push(gen.ellipse(cx, cy, w, h, { seed: this.seed++, roughness: 1.1, fill: HATCH[fill], fillStyle: style, hachureGap: 6, hachureAngle: -41, fillWeight: 1.4, stroke: 'none' }), `sk-${fill} sk-hatch`, 1.4, (this.t += step));
    this.push(gen.ellipse(cx, cy, w, h, { seed: this.seed++, roughness: 1.2, strokeWidth: 2.1, stroke: HATCH[line] }), `sk-${line}`, 2.1, (this.t += 40));
  }
  dot(cx: number, cy: number, r: number, tone: Tone) {
    this.els.push({ d: `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`, cls: `sk-dot-${tone}`, w: 0, delay: (this.t += 14), fillCls: 'dot' });
  }
  // an arrow along a soft curve, with a hand-drawn head
  arrow(pts: [number, number][], tone: Tone = 'ink', w = 2) {
    this.path(pts, tone, w, 160);
    const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const L = 13;
    for (const s of [-1, 1]) {
      const x = b[0] - L * Math.cos(ang + s * 0.5), y = b[1] - L * Math.sin(ang + s * 0.5);
      this.line(b[0], b[1], x, y, tone, w, 20);
    }
  }
  text(x: number, y: number, s: string, cls = 'sk-lbl', anchor: 'start' | 'middle' | 'end' = 'middle', rotate = 0, step = 50) {
    const d = (this.t += step);
    this.texts.push(
      <text key={this.texts.length} x={x} y={y} textAnchor={anchor} className={`${cls} sk-fade`} style={{ ['--d' as string]: d }} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>{s}</text>,
    );
  }
}

function Frame({ pen, vb, label, caption, cat, catAlt }: { pen: Pen; vb: string; label: string; caption?: React.ReactNode; cat?: Pose; catAlt?: string }) {
  return (
    <figure className="sketch" role="img" aria-label={label}>
      {cat && <Cat pose={cat} width={112} className="sketch__cat" alt={catAlt ?? ''} />}
      <svg viewBox={vb} aria-hidden="true" focusable="false">
        {pen.els.map((e, i) =>
          e.fillCls ? (
            <path key={i} d={e.d} className={`${e.cls} sk-fade`} style={{ ['--d' as string]: e.delay, ...(e.fill ? { fill: e.fill } : {}) }} />
          ) : (
            <path key={i} d={e.d} className={e.cls} strokeWidth={e.w} pathLength={1} data-d="" style={{ ['--d' as string]: e.delay }} />
          ),
        )}
        {pen.texts}
      </svg>
      {caption && <figcaption><b>Figure</b><span>{caption}</span></figcaption>}
    </figure>
  );
}

// ------------------------------------------------------------------ bars: a number against a number
export function Bars({
  data, max, caption, label, cat, title, callout, seed = 1, unit = '%',
}: {
  data: { label: string; sub?: string; value: number; shown?: string; tone: Tone }[];
  max?: number; caption?: React.ReactNode; label: string; cat?: Pose; title?: string; unit?: string; seed?: number;
  callout?: { text: string; to: number; dx?: number; dy?: number };
}) {
  const pen = new Pen(); pen.seed = seed * 37;
  const W = 680, base = 330, top = title ? 92 : 60, n = data.length;
  const m = max ?? Math.max(...data.map((d) => d.value));
  const slot = (W - 120) / n, bw = Math.min(118, slot * 0.56);
  if (title) pen.text(40, 46, title, 'sk-mid', 'start', -1.5);
  pen.line(44, base, W - 30, base, 'ink', 2.4, 0);
  data.forEach((d, i) => {
    const cx = 80 + slot * i + slot / 2, h = Math.max(4, ((base - top) * d.value) / m);
    pen.rect(cx - bw / 2, base - h, bw, h, d.tone, 'ink');
    pen.text(cx, base - h - 14, d.shown ?? `${d.value}${unit}`, `sk-big sk-val-${d.tone === 'mute' ? 'plum' : d.tone}`);
    pen.text(cx, base + 34, d.label, 'sk-lbl');
    if (d.sub) pen.text(cx, base + 60, d.sub, 'sk-sm');
  });
  if (callout) {
    const i = callout.to, cx = 80 + slot * i + slot / 2, h = ((base - top) * data[i].value) / m;
    const tx = cx + (callout.dx ?? 150), ty = base - h + (callout.dy ?? 10);
    pen.text(tx, ty, callout.text, 'sk-mid sk-val-plum', 'middle', -4);
    pen.arrow([[tx - 30, ty + 14], [tx - 60, ty + 34], [cx + bw / 2 + 12, base - h + 30]], 'plum');
  }
  return <Frame pen={pen} vb={`0 0 ${W} ${data.some((d) => d.sub) ? 410 : 390}`} label={label} caption={caption} cat={cat} />;
}

// ------------------------------------------------------------------ dots: people out of a group
export function Dots({ total, groups, cols = 12, caption, label, cat, seed = 2 }: { total: number; groups: { n: number; tone: Tone; label: string }[]; cols?: number; caption?: React.ReactNode; label: string; cat?: Pose; seed?: number }) {
  const pen = new Pen(); pen.seed = seed * 41;
  const gap = 34, x0 = 56, y0 = 70, rows = Math.ceil(total / cols);
  let k = 0;
  groups.forEach((g) => { for (let j = 0; j < g.n; j++, k++) { const c = k % cols, r = Math.floor(k / cols); pen.dot(x0 + c * gap + ((r * 7) % 3) - 1, y0 + r * gap + ((c * 5) % 3) - 1, 11, g.tone === 'ink' ? 'plum' : g.tone); } });
  const lx = x0 + cols * gap + 26;
  groups.forEach((g, i) => {
    const y = y0 + 6 + i * 62;
    pen.dot(lx + 8, y - 8, 9, g.tone === 'ink' ? 'plum' : g.tone);
    pen.text(lx + 28, y, `${g.n} of ${total}`, `sk-mid sk-val-${g.tone === 'mute' ? 'plum' : g.tone === 'ink' ? 'plum' : g.tone}`, 'start');
    pen.text(lx + 28, y + 26, g.label, 'sk-sm', 'start');
  });
  const H = Math.max(y0 + rows * gap + 10, y0 + groups.length * 62 + 20);
  return <Frame pen={pen} vb={`20 30 ${lx + 250} ${H}`} label={label} caption={caption} cat={cat} />;
}

// ------------------------------------------------------------------ a line over weeks, with shaded stretches
export function Weeks({ caption, label, cat, seed = 3, zones, points, marks, yTop, yBottom, xMax, xLabel }: {
  caption?: React.ReactNode; label: string; cat?: Pose; seed?: number;
  zones: { from: number; to: number; tone: Tone; label: string }[];
  points: [number, number][]; marks?: { x: number; y: number; label: string; dy?: number }[];
  yTop: string; yBottom: string; xMax: number; xLabel: string;
}) {
  const pen = new Pen(); pen.seed = seed * 43;
  const L = 70, R = 650, T = 50, B = 320;
  const X = (w: number) => L + ((R - L) * w) / xMax, Y = (v: number) => B - ((B - T) * v) / 100;
  zones.forEach((z) => { pen.rect(X(z.from), T - 6, X(z.to) - X(z.from), B - T + 6, z.tone, z.tone === 'sky' ? 'sky' : 'rose', 80); pen.text((X(z.from) + X(z.to)) / 2, T + 26, z.label, 'sk-mid sk-val-plum'); });
  pen.line(L, B, R + 10, B, 'ink', 2.4, 40);
  pen.line(L, B, L, T - 14, 'ink', 2.4, 40);
  pen.text(L - 14, T + 4, yTop, 'sk-sm', 'end');
  pen.text(L - 14, B, yBottom, 'sk-sm', 'end');
  for (let w = 0; w <= xMax; w += xMax > 12 ? 4 : 2) pen.text(X(w), B + 28, String(w), 'sk-sm');
  pen.text((L + R) / 2, B + 58, xLabel, 'sk-lbl');
  pen.path(points.map(([w, v]) => [X(w), Y(v)]), 'plum', 3.2, 300);
  (marks ?? []).forEach((m) => { pen.dot(X(m.x), Y(m.y), 7, 'plum'); pen.text(X(m.x), Y(m.y) - 18 + (m.dy ?? 0), m.label, 'sk-lbl'); });
  return <Frame pen={pen} vb="0 20 690 380" label={label} caption={caption} cat={cat} />;
}

// ------------------------------------------------------------------ the rhythm: lift, then let go for twice as long
export function Rhythm({ caption, label, cat, seed = 4, lift = 2, rest = 4, reps = 3 }: { caption?: React.ReactNode; label: string; cat?: Pose; seed?: number; lift?: number; rest?: number; reps?: number }) {
  const pen = new Pen(); pen.seed = seed * 47;
  const L = 50, base = 260, hi = 120, unit = 600 / ((lift + rest) * reps);
  let x = L;
  const pts: [number, number][] = [[x, base]];
  for (let i = 0; i < reps; i++) {
    pen.rect(x, hi - 10, lift * unit, base - hi + 10, 'rose', 'rose', 60);
    pen.rect(x + lift * unit, hi - 10, rest * unit, base - hi + 10, 'sky', 'sky', 60);
    pts.push([x + 4, hi + 6], [x + lift * unit - 4, hi + 6], [x + lift * unit + 10, base - 10], [x + (lift + rest) * unit, base - 10]);
    if (i === 0) {
      pen.text(x + (lift * unit) / 2, hi - 26, `lift ${lift} s`, 'sk-mid sk-val-rose');
      pen.text(x + lift * unit + (rest * unit) / 2, hi - 26, `let go ${rest} s`, 'sk-mid sk-val-sky');
    }
    x += (lift + rest) * unit;
  }
  pen.path(pts, 'plum', 3.2, 300, false);
  pen.line(L - 6, base + 14, x + 16, base + 14, 'ink', 2.2, 40);
  for (let s = 0; s <= (lift + rest) * reps; s += lift + rest) pen.text(L + s * unit, base + 44, `${s} s`, 'sk-sm');
  pen.text(L + 330, base + 78, 'Let go takes twice as long as the lift', 'sk-lbl');
  return <Frame pen={pen} vb="20 70 680 300" label={label} caption={caption} cat={cat} />;
}

// ------------------------------------------------------------------ the hammock: pubic bone to tailbone, organs on top
export function Hammock({ caption, label, cat, seed = 5 }: { caption?: React.ReactNode; label: string; cat?: Pose; seed?: number }) {
  const pen = new Pen(); pen.seed = seed * 53;
  // bones
  pen.ellipse(110, 250, 54, 88, 'mute', 'ink', 80, 'cross-hatch');
  pen.text(110, 330, 'pubic bone', 'sk-lbl');
  pen.path([[560, 150], [590, 200], [596, 248], [580, 286]], 'ink', 9, 120);
  pen.text(600, 330, 'tailbone', 'sk-lbl');
  // organs
  pen.tint('ellipse', 220, 240, 120, 100, 'sky');
  pen.text(220, 248, 'bladder', 'sk-mid');
  pen.tint('ellipse', 345, 245, 110, 128, 'rose');
  pen.text(345, 253, 'uterus', 'sk-mid');
  pen.tint('ellipse', 470, 247, 110, 104, 'plum');
  pen.text(470, 255, 'bowel', 'sk-mid');
  // the hammock
  pen.path([[140, 262], [250, 300], [360, 312], [470, 300], [574, 270]], 'rose', 5.5, 260);
  pen.text(360, 352, 'your pelvic floor: a hammock of muscle', 'sk-mid sk-val-rose');
  // lift and let go
  pen.arrow([[650, 230], [650, 180], [650, 130]], 'plum');
  pen.text(660, 116, 'lift', 'sk-lbl', 'start');
  pen.arrow([[30, 160], [30, 210], [30, 258]], 'sky');
  pen.text(22, 146, 'let go', 'sk-lbl', 'start');
  return <Frame pen={pen} vb="0 100 720 280" label={label} caption={caption} cat={cat} />;
}

// ------------------------------------------------------------------ steps: a short sequence of boxes and arrows
export function Steps({ steps, caption, label, cat, seed = 6 }: { steps: { title: string; sub?: string; tone: Tone; cross?: boolean }[]; caption?: React.ReactNode; label: string; cat?: Pose; seed?: number }) {
  const pen = new Pen(); pen.seed = seed * 59;
  const n = steps.length, W = 680, bw = Math.min(180, (W - 60 - (n - 1) * 46) / n), gap = (W - 40 - n * bw) / Math.max(1, n - 1);
  steps.forEach((s, i) => {
    const x = 20 + i * (bw + gap);
    pen.tint('rect', x, 90, bw, 130, s.tone);
    pen.text(x + bw / 2, 150, s.title, 'sk-mid');
    if (s.sub) pen.text(x + bw / 2, 182, s.sub, 'sk-sm');
    if (s.cross) { pen.line(x + 12, 100, x + bw - 12, 210, 'rose', 3.4, 80); pen.line(x + bw - 12, 100, x + 12, 210, 'rose', 3.4, 60); }
    if (i < n - 1) pen.arrow([[x + bw + 8, 150], [x + bw + gap / 2, 140], [x + bw + gap - 8, 150]], 'plum');
  });
  return <Frame pen={pen} vb="0 70 700 170" label={label} caption={caption} cat={cat} />;
}
