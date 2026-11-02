/* Health Class · ink: window.HCInk. The class cat, drawn as a clean hand-drawn line (one thin, even stroke, round ends,
   white body, open line ends like a pen drawing), in 6 frames: the same drawing redrawn with a slight wobble (the
   boil of a hand-drawn loop) and one small motion (a tail, a breath, a blink). css/look.css swaps the frames 7 times a
   second while the drawing is on screen (app.js adds .is-live), and shows frame 1 alone under reduced motion.
   HCInk.svg(name, { size, label, className }) → svg string · HCInk.names() → the drawings

   Drawing a pose: HCInk.define(name, { w, h, draw: function (t, K) { return [strokes] } }), t from 0 to 1 over the loop.
   Path data: absolute M, L, C, Q, S, T and Z only (no H, V, A, no lower case), so every number pair is a point the
   toolkit can move, turn and boil. The toolkit K:
     K.fill(d, color)            a filled area, no line (the white body under the lines)
     K.line(d, o)                a line, open or closed: o.w (weight, 1 = the pen), o.c (color), o.boil
     K.shape(d, color, o)        a closed shape: its fill, then its line
     K.dot(x, y, r, color)       a dot (eyes, nose)
     K.xf(d, o)                  the path moved: o.x, o.y, o.s | o.sx, o.sy, o.r (degrees, about o.ox, o.oy)
     K.place(strokes, o)         a list of strokes moved the same way
     K.smooth(points, closed)    a soft path through [[x, y], ...]
     K.wave(t, amp, phase)       amp * sin(2π (t + phase)): the loop's motion
     K.part(name, o)             a part from the model sheet (the head with its expressions, a paw, ...)
   Colors: 'w' white, 'r' rose, 'rs' rose soft, 'p' plum, 's' sky, 'ss' sky soft, 'k' the line. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.HCInk) return;

  var FRAMES = 6, TAU = Math.PI * 2, BOIL = 0.42;
  var LINE = '#4A2433';
  var COLORS = { w: '#FFFFFF', r: '#D9566F', rs: '#F9D5DB', p: '#7C2D4B', s: '#9CC3E6', ss: '#DCEAF6', k: LINE };

  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function f2(n) { return Math.round(n * 100) / 100; }

  // ------------------------------------------------------------------------------------------------ path data
  // → [{ c: 'M', p: [[x, y], ...] }, ...]
  function parse(d) {
    var tok = String(d).match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [], out = [], cur = null, nums = [];
    function flush() {
      if (!cur) return;
      if (nums.length % 2) throw new Error('HCInk: odd numbers after ' + cur);
      var p = []; for (var i = 0; i < nums.length; i += 2) p.push([nums[i], nums[i + 1]]);
      out.push({ c: cur, p: p }); nums = [];
    }
    tok.forEach(function (t) {
      if (/[A-Za-z]/.test(t)) {
        flush();
        if ('MLCQSTZ'.indexOf(t) < 0) throw new Error('HCInk: use absolute M L C Q S T Z only, not ' + t);
        cur = t;
      } else nums.push(+t);
    });
    flush();
    return out;
  }
  function print(cmds) { return cmds.map(function (k) { return k.c + k.p.map(function (q) { return f2(q[0]) + ' ' + f2(q[1]); }).join(' '); }).join(''); }
  function tfPt(q, o) {
    var a = (o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), sx = o.sx || o.s || 1, sy = o.sy || o.s || 1, ox = o.ox || 0, oy = o.oy || 0;
    var x = (q[0] - ox) * sx, y = (q[1] - oy) * sy;
    return [ox + x * c - y * s + (o.x || 0), oy + x * s + y * c + (o.y || 0)];
  }
  function xf(d, o) { if (!o) return d; return print(parse(d).map(function (k) { return { c: k.c, p: k.p.map(function (q) { return tfPt(q, o); }) }; })); }
  function smooth(p, closed) {
    var n = p.length; if (n < 2) return '';
    var d = 'M' + f2(p[0][0]) + ' ' + f2(p[0][1]);
    if (n === 2 && !closed) return d + 'L' + f2(p[1][0]) + ' ' + f2(p[1][1]);
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = p[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
      d += 'C' + f2(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f2(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f2(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f2(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f2(p2[0]) + ' ' + f2(p2[1]);
    }
    return d + (closed ? 'Z' : '');
  }
  // the hand: every point moves a little, the same way for the same frame of the same drawing
  function boil(d, r, amt) {
    if (!amt) return d;
    return print(parse(d).map(function (k) { return { c: k.c, p: k.p.map(function (q) { return [q[0] + (r() - 0.5) * 2 * amt, q[1] + (r() - 0.5) * 2 * amt]; }) }; }));
  }

  // ------------------------------------------------------------------------------------------------ strokes
  function fill(d, color) { return { t: 'fill', d: d, fill: color || 'w' }; }
  function line(d, o) { o = o || {}; return { t: 'line', d: d, w: o.w || 1, c: o.c || 'k', boil: o.boil == null ? 1 : o.boil }; }
  function shape(d, color, o) { o = o || {}; return { t: 'shape', d: d, fill: color || 'w', w: o.w || 1, c: o.c || 'k', boil: o.boil == null ? 1 : o.boil }; }
  function dot(x, y, r, color) { return { t: 'dot', x: x, y: y, r: r, fill: color || 'k' }; }
  function moved(s, o) {
    var c = {}; for (var k in s) c[k] = s[k];
    if (s.t === 'dot') { var q = tfPt([s.x, s.y], o); c.x = q[0]; c.y = q[1]; c.r = s.r * Math.abs(o.s || o.sx || 1); }
    else c.d = xf(s.d, o);
    return c;
  }
  function place(list, o) { return list.map(function (s) { return moved(s, o); }); }
  function wave(t, amp, ph) { return amp * Math.sin((t + (ph || 0)) * TAU); }

  var PARTS = {};
  var K = { fill: fill, line: line, shape: shape, dot: dot, xf: xf, place: place, smooth: smooth, wave: wave, TAU: TAU,
    part: function (name, o) { var f = PARTS[name]; if (!f) throw new Error('HCInk: no part ' + name); return f(o || {}, K); } };

  function render(list, r, sw) {
    var out = '';
    list.forEach(function (s) {
      var col = function (c) { return COLORS[c] || c; };
      if (s.t === 'dot') {
        out += '<circle cx="' + f2(s.x + (r() - 0.5) * 0.5) + '" cy="' + f2(s.y + (r() - 0.5) * 0.5) + '" r="' + f2(s.r) + '" fill="' + col(s.fill) + '" stroke="none"/>';
        return;
      }
      var d = boil(s.d, r, BOIL * (s.boil == null ? 1 : s.boil));
      if (s.t === 'fill') { out += '<path d="' + d + '" fill="' + col(s.fill) + '" stroke="none"/>'; return; }
      if (s.t === 'shape') out += '<path d="' + d + '" fill="' + col(s.fill) + '" stroke="none"/>';
      out += '<path d="' + d + '" fill="none" stroke="' + col(s.c) + '"' + (s.w !== 1 ? ' stroke-width="' + f2(sw * s.w) + '"' : '') + '/>';
    });
    return out;
  }

  // ------------------------------------------------------------------------------------------------ the drawings
  var D = {}, ORDER = [];
  function define(name, def) { if (!D[name]) ORDER.push(name); D[name] = def; }
  function part(name, fn) { PARTS[name] = fn; }

  // the pen: about 1.8 px on screen whatever the drawing's size (1.6 px under 96 px, 1.4 px under 60 px)
  function pen(size) { return size >= 96 ? 1.8 : size >= 60 ? 1.6 : 1.4; }

  function svg(name, o) {
    o = o || {};
    var d = D[name];
    if (!d) return '';
    var size = +o.size || 160, h = Math.round(size * d.h / d.w), sw = pen(size) * d.w / size, seed = hash(name), frames = '';
    for (var i = 0; i < FRAMES; i++) frames += '<g class="ink__f" style="--i:' + i + '">' + render(d.draw(i / FRAMES, K), rng(seed + i * 7919), sw) + '</g>';
    return '<svg class="ink ink--' + name + (o.className ? ' ' + o.className : '') + '" viewBox="0 0 ' + d.w + ' ' + d.h + '" width="' + size + '" height="' + h + '" fill="none" stroke="' + LINE + '" stroke-width="' + f2(sw) + '" stroke-linecap="round" stroke-linejoin="round"' +
      (o.label ? ' role="img" aria-label="' + String(o.label).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true" focusable="false"') + '>' + frames + '</svg>';
  }

  // ------------------------------------------------------------------------------------------------ the logo
  // "HC" in Fraunces (weight 580, optical size 72, drawn as outlines so it never depends on a font) and one curved bar
  // under it. One drawing for the app icon, the launch screen and the app (resources/icon.html and the Android
  // drawables carry the same path). Box: x 20 to 80, y 27 to 79.
  var LOGO_HC = 'M28.09 44.13H44.72V45.42H28.09ZM31.2 55.71Q31.2 56.06 31.43 56.27Q31.66 56.48 32.09 56.58L33.47 56.84Q34.03 56.99 34.03 57.45Q34.03 57.7 33.86 57.85Q33.68 58 33.3 58H23.33Q22.95 58 22.77 57.85Q22.59 57.7 22.59 57.45Q22.59 56.99 23.16 56.84L24.53 56.58Q24.98 56.48 25.2 56.27Q25.43 56.06 25.43 55.71V32.29Q25.43 31.94 25.2 31.73Q24.98 31.52 24.53 31.42L23.16 31.16Q22.59 31.01 22.59 30.55Q22.59 30.29 22.77 30.15Q22.95 30 23.33 30H33.3Q33.68 30 33.86 30.15Q34.03 30.29 34.03 30.55Q34.03 31.01 33.47 31.16L32.09 31.42Q31.66 31.52 31.43 31.73Q31.2 31.94 31.2 32.29ZM48.33 55.71Q48.33 56.06 48.55 56.27Q48.78 56.48 49.22 56.58L50.6 56.84Q51.16 56.99 51.16 57.45Q51.16 57.7 50.98 57.85Q50.81 58 50.43 58H40.45Q40.08 58 39.9 57.85Q39.72 57.7 39.72 57.45Q39.72 56.99 40.28 56.84L41.66 56.58Q42.11 56.48 42.33 56.27Q42.55 56.06 42.55 55.71V32.29Q42.55 31.94 42.33 31.73Q42.11 31.52 41.66 31.42L40.28 31.16Q39.72 31.01 39.72 30.55Q39.72 30.29 39.9 30.15Q40.08 30 40.45 30H50.43Q50.81 30 50.98 30.15Q51.16 30.29 51.16 30.55Q51.16 31.01 50.6 31.16L49.22 31.42Q48.78 31.52 48.55 31.73Q48.33 31.94 48.33 32.29ZM77.41 50.27Q77.31 51.89 76.5 53.4Q75.7 54.9 74.27 56.1Q72.84 57.29 70.87 57.98Q68.9 58.68 66.47 58.68Q62.3 58.68 59.27 56.85Q56.23 55.02 54.59 51.77Q52.95 48.53 52.95 44.27Q52.95 41.02 53.94 38.3Q54.92 35.58 56.72 33.58Q58.52 31.58 60.97 30.48Q63.42 29.38 66.34 29.38Q68.31 29.38 69.59 29.79Q70.87 30.21 71.58 30.62Q72.3 31.04 72.59 31.04Q72.97 31.04 73.31 30.65Q73.66 30.27 73.99 29.89Q74.33 29.5 74.65 29.5Q74.88 29.5 75.03 29.65Q75.19 29.8 75.29 30.17L77.34 37.49Q77.44 37.81 77.3 38.05Q77.17 38.28 76.86 38.35Q76.55 38.41 76.31 38.27Q76.06 38.14 75.91 37.8Q74.83 35.23 73.5 33.69Q72.16 32.15 70.61 31.47Q69.06 30.79 67.29 30.79Q65.48 30.79 63.95 31.6Q62.43 32.42 61.3 33.96Q60.17 35.51 59.56 37.71Q58.94 39.92 58.94 42.71Q58.94 47.01 60.19 49.94Q61.44 52.88 63.63 54.38Q65.82 55.88 68.65 55.88Q71.49 55.88 73.49 54.39Q75.49 52.89 76.37 50.21Q76.52 49.92 76.67 49.81Q76.83 49.7 77.04 49.74Q77.23 49.76 77.32 49.9Q77.41 50.05 77.41 50.27Z';
  var LOGO_BAR = 'M27 68C38 77 62 77 73 68';
  function logo(o) {
    o = o || {};
    return '<svg class="hc-lg' + (o.className ? ' ' + o.className : '') + '" viewBox="20 27 60 52"' + (o.size ? ' width="' + o.size + '" height="' + Math.round(o.size * 52 / 60) + '"' : '') +
      (o.label === false ? ' aria-hidden="true" focusable="false"' : ' role="img" aria-label="' + (o.label || 'Health Class') + '"') + '>' +
      '<path class="hc-lg__hc" d="' + LOGO_HC + '"/><path class="hc-lg__bar" d="' + (o.bar || LOGO_BAR) + '"/></svg>';
  }
  // the bar with its lowest point `sag` units under its ends (9 at rest)
  function logoBar(sag) { var c = 68 + sag; return 'M27 68C38 ' + f2(c) + ' 62 ' + f2(c) + ' 73 68'; }

  window.HCInk = {
    svg: svg, names: function () { return ORDER.slice(); }, frames: FRAMES, define: define, part: part, K: K, COLORS: COLORS,
    logo: logo, logoBar: logoBar, LOGO_HC: LOGO_HC, LOGO_BAR: LOGO_BAR
  };
})();

// ---------------------------------------------------------------- parts
/* Health Class cat · the shared model (parts.js). Load after engine.js and before any poses file:
     node render.mjs --files engine.js,parts.js,poses-yours.js --poses ...
   Read MODEL.md first: it gives the construction rules these parts follow.

   PARTS (K.part(name, o) returns a list of strokes, back to front, ready to concat into a drawing)
     head   the soft wide head, 3/4 right (like the reference), 3/4 left or front, with its expressions
     paw    a leg's end: two lines open at the top, a round U, curved toe ticks
     leg    a whole slim leg from a shoulder (open top, inside the body) to a paw tip: for raised paws
     tail   an even-width tail along a few pen-tool nodes, a round tip, open at the root
     sit    the sitting cat, 3/4 right (body, back, haunch, chest, front legs, tail round the feet, head): the base of
            every sitting pose; it also hands back anchor points (.at) to hang a raised paw or a prop on

   THE KIT (I.kit, for poses files): small helpers the parts use, so every artist bends lines the same way
     I.kit.chain(nodes)        pen-tool nodes [x, y, heading°, hIn, hOut, headingOut°?] -> cubic segments
     I.kit.d(segs)             segments -> path data ('M..C..')        I.kit.segs(d)  path data (M L C) -> segments
     I.kit.rev(segs)           the segments drawn the other way        I.kit.cut(segs, u0, u1)  part of a chain (u in segments)
     I.kit.warp(d, fn)         every point of a path through fn([x, y]) -> [x, y]
     I.kit.move(strokes, fn)   every stroke of a list through fn (dots too)
     I.kit.rot(p, c, deg)      a point turned about c         I.kit.sstep(a, b, v)  smoothstep
     I.kit.blink(t)            true on exactly one frame of the six (the blink frame, t in [4/6, 5/6))
     I.kit.tube(segs, w)       an even-width band along a centre chain -> { a: left edge, b: right edge, cap }
     I.kit.fill(d, color)      a white area under the lines that boils less than the pen (use it instead of K.fill)
     I.kit.P(p)                'x y' rounded to 0.01

   Paths use absolute M, L, C, Z only. Units: the stretch's scale (the head is 42 units wide at s 1). */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I) return;
  var RAD = Math.PI / 180;

  // ================================================================================================ the kit
  function r2(n) { return Math.round(n * 100) / 100; }
  function P(p) { return r2(p[0]) + ' ' + r2(p[1]); }
  function add(p, v, k) { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function dist(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }
  function unit(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function vec(deg, l) { l = l == null ? 1 : l; return [Math.cos(deg * RAD) * l, Math.sin(deg * RAD) * l]; }
  // the left of a direction, on screen (y down): heading right (1, 0) -> up (0, -1)
  function leftOf(t) { return [t[1], -t[0]]; }
  function rot(p, c, deg) { var a = deg * RAD, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; }
  function sstep(a, b, v) { var t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); }
  function blink(t) { return t >= 4 / 6 - 1e-6 && t < 5 / 6 - 1e-6; }

  // every point of a path through fn (absolute commands only, so every number pair is a point)
  function warp(d, fn) {
    var tok = String(d).match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [], out = '', nums = [];
    function flush() { for (var i = 0; i + 1 < nums.length; i += 2) { var q = fn([nums[i], nums[i + 1]]); out += r2(q[0]) + ' ' + r2(q[1]) + ' '; } nums = []; }
    tok.forEach(function (t) { if (/[A-Za-z]/.test(t)) { flush(); out = out.replace(/ $/, '') + t; } else nums.push(+t); });
    flush();
    return out.replace(/ $/, '');
  }
  function moveOne(st, fn) {
    var c = {}; for (var k in st) c[k] = st[k];
    if (st.t === 'dot') { var q = fn([st.x, st.y]), q2 = fn([st.x + st.r, st.y]); c.x = q[0]; c.y = q[1]; c.r = dist(q, q2); }
    else c.d = warp(st.d, fn);
    return c;
  }
  function move(list, fn) { return list.map(function (s) { return moveOne(s, fn); }); }

  // segments: [[p0, c1, c2, p1], ...]
  function chain(nodes) {
    var segs = [];
    for (var i = 0; i + 1 < nodes.length; i++) {
      var A = nodes[i], B = nodes[i + 1], ao = A[5] == null ? A[2] : A[5];
      segs.push([[A[0], A[1]], add([A[0], A[1]], vec(ao, A[4])), add([B[0], B[1]], vec(B[2], -B[3])), [B[0], B[1]]]);
    }
    return segs;
  }
  function dOf(segs, closed) {
    if (!segs.length) return '';
    var d = 'M' + P(segs[0][0]);
    segs.forEach(function (s) { d += 'C' + P(s[1]) + ' ' + P(s[2]) + ' ' + P(s[3]); });
    return d + (closed ? 'Z' : '');
  }
  function cOf(segs) { return dOf(segs).replace(/^M[^C]*/, ''); }   // the same, without its M (to append)
  function segsOf(d) {
    var tok = String(d).match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [], segs = [], cur = null, nums = [], at = null, start = null;
    function flush() {
      var q = []; for (var i = 0; i + 1 < nums.length; i += 2) q.push([nums[i], nums[i + 1]]);
      if (cur === 'M') { at = q[0]; start = at; q.slice(1).forEach(function (p) { segs.push([at, lerp(at, p, 1 / 3), lerp(at, p, 2 / 3), p]); at = p; }); }
      else if (cur === 'L') q.forEach(function (p) { segs.push([at, lerp(at, p, 1 / 3), lerp(at, p, 2 / 3), p]); at = p; });
      else if (cur === 'C') for (var j = 0; j + 2 < q.length; j += 3) { segs.push([at, q[j], q[j + 1], q[j + 2]]); at = q[j + 2]; }
      else if (cur === 'Z' && start && dist(at, start) > 1e-6) { segs.push([at, lerp(at, start, 1 / 3), lerp(at, start, 2 / 3), start]); at = start; }
      nums = [];
    }
    tok.forEach(function (t) { if (/[A-Za-z]/.test(t)) { if (cur) flush(); cur = t; } else nums.push(+t); });
    if (cur) flush();
    return segs;
  }
  function revSegs(segs) { return segs.slice().reverse().map(function (s) { return [s[3], s[2], s[1], s[0]]; }); }
  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
  }
  function split(s, t) {
    var a = lerp(s[0], s[1], t), b = lerp(s[1], s[2], t), c = lerp(s[2], s[3], t), d = lerp(a, b, t), e = lerp(b, c, t), f = lerp(d, e, t);
    return [[s[0], a, d, f], [f, e, c, s[3]]];
  }
  function cut(segs, u0, u1) {
    var out = [];
    for (var i = Math.max(0, Math.floor(u0)); i < Math.ceil(u1) && i < segs.length; i++) {
      var s = segs[i], a = Math.max(0, u0 - i), b = Math.min(1, u1 - i);
      if (b <= a) continue;
      if (b < 1) s = split(s, b)[0];
      if (a > 0) s = split(s, a / b)[1];
      out.push(s);
    }
    return out;
  }
  function mapSegs(segs, fn) { return segs.map(function (s) { return s.map(fn); }); }
  // a cubic offset sideways by d (left of its direction for d > 0): Tiller-Hanson, the control polygon's edges moved
  // out and met again. Within 0.2 unit for a segment turning up to 60 degrees; tube() halves the ones that turn more
  // first (few long segments keep the boil smooth: every node and handle trembles on its own).
  function isect(p, u, q, v) { var den = u[0] * v[1] - u[1] * v[0]; if (Math.abs(den) < 1e-9) return null; var s = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / den; return [p[0] + s * u[0], p[1] + s * u[1]]; }
  function offSeg(s, d) {
    var p0 = s[0], p1 = s[1], p2 = s[2], p3 = s[3];
    var t0 = unit(dist(p0, p1) > 1e-6 ? sub(p1, p0) : sub(p2, p0)), t1 = unit(dist(p1, p2) > 1e-6 ? sub(p2, p1) : sub(p3, p0)), t2 = unit(dist(p2, p3) > 1e-6 ? sub(p3, p2) : sub(p3, p1));
    var q0 = add(p0, leftOf(t0), d), q3 = add(p3, leftOf(t2), d), m = add(p1, leftOf(t1), d);
    var h1 = add(p1, leftOf(t0), d), h2 = add(p2, leftOf(t2), d);
    var q1 = isect(q0, t0, m, t1), q2 = isect(q3, t2, m, t1);
    if (!q1 || dist(q1, h1) > dist(p0, p1) * 0.6 + 0.5) q1 = h1;
    if (!q2 || dist(q2, h2) > dist(p2, p3) * 0.6 + 0.5) q2 = h2;
    return [q0, q1, q2, q3];
  }
  function turnOf(s) { var a = sub(s[1], s[0]), b = sub(s[3], s[2]); if (Math.hypot(a[0], a[1]) < 1e-6) a = sub(s[2], s[0]); if (Math.hypot(b[0], b[1]) < 1e-6) b = sub(s[3], s[1]); var x = Math.atan2(a[1], a[0]), y = Math.atan2(b[1], b[0]), t = Math.abs(y - x); return Math.min(t, 2 * Math.PI - t) / RAD; }
  function tube(center, w) {
    var hw = w / 2, segs = [];
    center.forEach(function (s) { if (turnOf(s) > 62) { var h = split(s, 0.5); segs.push(h[0], h[1]); } else segs.push(s); });
    var a = segs.map(function (s) { return offSeg(s, hw); }), b = segs.map(function (s) { return offSeg(s, -hw); });
    var L = segs[segs.length - 1], e = L[3], t = unit(dist(L[2], e) > 1e-6 ? sub(e, L[2]) : sub(e, L[1])), n = leftOf(t), k = 0.5523 * hw;
    var ae = add(e, n, hw), be = add(e, n, -hw), tip = add(e, t, hw);
    var cap = [[ae, add(ae, t, k), add(tip, n, k), tip], [tip, add(tip, n, -k), add(be, t, k), be]];
    return { a: a, b: b, cap: cap, center: segs };
  }
  // the y of a chain where it crosses x (first crossing), for placing a paw on a tail
  function yAt(segs, x) {
    for (var i = 0; i < segs.length; i++) for (var j = 0; j < 40; j++) {
      var p = bez(segs[i], j / 40), q = bez(segs[i], (j + 1) / 40);
      if ((p[0] - x) * (q[0] - x) <= 0 && p[0] !== q[0]) return p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]);
    }
    return null;
  }

  var kit_bez = bez;
  // a white (or flat colour) area that boils less than the pen, so it never peeks out past the line on a dark screen
  function soft(d, color) { var f = I.K.fill(d, color || 'w'); f.boil = 0.25; return f; }
  I.kit = { fill: soft, chain: chain, d: dOf, segs: segsOf, rev: revSegs, cut: cut, warp: warp, move: move, rot: rot, sstep: sstep,
    blink: blink, tube: tube, P: P, yAt: yAt, mapSegs: mapSegs };

  // ================================================================================================ head
  /* K.part('head', o): the head. A soft rounded box a bit wider than tall (42 x 34 at s 1, ears 11 more), two small
     pointed ears set wide at its top corners (sides gently concave, tips a touch rounded), the face small and low.
       o.x, o.y     where the head's centre goes                        o.s     scale (1 = 42 units wide)
       o.tilt       degrees, + turns clockwise on screen                o.facing 'r' 3/4 right (default) | 'l' 3/4 left | 'f' front
       o.eyes       'open' (default) | 'closed' (calm lids, bowed down) | 'happy' (^ ^) | 'wink' (far eye ^, near open)
                    | 'look' (dots moved by dx, dy)
       o.dx, o.dy   with 'look': where the eyes look, in head units (-2..2)
       o.eyeR       eye size factor (default 1: dots r 1.6 near, 1.5 far). 1.2 for a drawing shown under 96 px
       o.mouth      'small' (default: a tiny rounded nose, a short stem and a soft little ㅅ, calm) | 'smile' (the ㅅ's
                    ends turn up: happy) | 'open' (a small open mouth: cheer, laugh) | 'flat' (a short flat line, no stem: worry)
                    | 'none' (the nose alone)
       o.ears       [near, far] degrees: + turns an ear out and down, - pricks it up (worry: [52, 50] with earLen 0.65,
                    flattened out to the sides)   default [0, 0]. A turned ear is the same small two-sided triangle (see earQ)
       o.earLen     ear height factor (0.8 = lowered ears)                                         default 1
       o.skull      3/4 only. true: the outline also runs down the back of the skull to the nape (an upright body: the
                    back line leaves from the nape, see o.lead). false (default): it starts at the near ear's short
                    outer stub, as in the reference stretch, where the back line meets that stub.
       o.lead       3/4 only: a path in canvas units that ends at the head's start point (the nape with o.skull, else the
                    stub's end: get it from o.anchors). The head joins it to its outline, so the back and the head are
                    one pen stroke (the sit part does this)
       o.trail      a path in canvas units that starts at the chin's end (get it from o.anchors: chin): the head runs
                    its outline on into it, one pen stroke (the sit part's chest and far front leg). Draw the whites
                    the trail passes along BEFORE the head, since the head's line is drawn with the head
       o.chin       true: a short chin line under the face (front: always worth it when no body line passes there)
       o.whiskers   true: two short ticks past the far cheek (3/4) or both cheeks (front)
       o.fill       false: no white under the head
       o.anchors    true: return points in canvas units instead of strokes: { c, nape, stub, chin, jaw, nose, eyeN, eyeF,
                    earN, earF, top, s, napeHeading }
     The near ear is open at its base and its outer side runs on a little as a stub (the reference's); the far ear is a
     closed triangle standing on the head's top line: it is its own stroke with its own white, drawn BEFORE the head's
     white, its two feet running 0.6 unit on under the top line, so the head's white hides them and the top line runs
     straight through (no foot ticks however the pen trembles). The face strokes boil less than the body (tiny). */
  // the near ear and far ear of the 3/4 head: base point, side cubic up to the tip, side cubic down to the other base
  // point. The two sides meet at ONE node: the pen's round join softens the tip (about the reference's own rounding).
  // No little cap cubic there: a 1-unit cap is smaller than the boil (0.42 a coordinate), so its direction flips frame
  // to frame into a flag or a bead. The handles at the tip are 2.4 units or longer, so the tip's angle holds.
  var EAR_N = [[-18.6, -15.6], [-17.4, -18.4], [-14.2, -24.0], [-11.8, -26.9], [-10.7, -24.6], [-8.6, -20.2], [-7.2, -17.4]];
  var EAR_F = [[-0.3, -17.1], [1.3, -21.0], [3.4, -25.2], [5.4, -28.1], [6.8, -25.6], [9.1, -21.2], [10.3, -16.6]];
  // the front head's left ear; the right one is its mirror
  var EAR_FL = [[-17.2, -15.2], [-16.7, -19.3], [-15.3, -24.3], [-13.4, -27.5], [-11.7, -25.0], [-9.5, -20.6], [-7.4, -17.6]];
  var H3 = {
    stub: 'M-21.1 -8.3C-20.6 -10.6 -19.6 -13.6 -18.6 -15.6',
    // the back of the skull (skull mode), from the nape up to the near ear's base, in place of the stub: a real round
    // corner, widest at x -23 (2.4 units out past the nape), so the head reads as a soft box on a slightly narrower
    // neck and the back line dips in under it, not the top of a bottle
    skull: 'M-21.4 13.6C-23.9 2.3 -22.6 -7.2 -18.6 -15.6', napeC: [-23.9, 2.3],
    // the top line, ONE cubic from the near ear's base right through under the far ear to the side, a hair domed
    // (the far ear is its own stroke, drawn before the head's white, its feet hidden under the top line)
    top: 'C-1.6 -17.75 5 -17.75 10.3 -16.6',
    side: 'C13.6 -15 21 -10 21.1 0.5C21.2 7.5 18.5 12.8 14.4 16.5',
    jaw: 'C8.5 19.6 -7.5 18.4 -13.6 13.6',
    jawToStub: 'C-18.2 10 -20.4 1.5 -21.1 -8.3', jawToNape: 'C-15.8 14.2 -18.7 14.1 -21.4 13.6',
    chin: 'M14.4 16.5C11.4 19.4 6.5 20.4 1.5 19.8',
    eyes: [[1.9, 0.8, 1.6], [16.9, -0.8, 1.5]], nose: [12.5, 5.8], whisk: [1],
    // chinT: a point on the cheek line 2 units before the chin's end, where a chest line starts (a T, the chin
    // overhanging it a little)
    at: { nape: [-21.4, 13.6], stub: [-21.1, -8.3], chin: [14.4, 16.5], chinT: [15.59, 15.34], jaw: [1.5, 19.6], earN: [-11.8, -26.9], earF: [5.4, -28.1], top: [1.5, -17.5] }
  };
  var HF = {
    start: 'M-13.6 16.8C-18.6 13.2 -21.2 7.5 -21.1 0.5C-21 -6.5 -19.6 -11.8 -17.2 -15.2',
    top: 'C-3 -18.4 3 -18.4 7.4 -17.6',
    side: 'C19.6 -11.8 21 -6.5 21.1 0.5C21.2 7.5 18.6 13.2 13.6 16.8',
    jaw: 'C6 21 -6 21 -13.6 16.8Z',
    chin: 'M7.5 19.6C3 20.9 -3 20.9 -7.5 19.6',
    eyes: [[-7.6, 0.8, 1.6], [7.6, 0.8, 1.6]], nose: [0, 5.8], whisk: [-1, 1],
    at: { nape: [-21.4, 13.6], stub: [-17.2, -15.2], chin: [0, 20.6], chinT: [0, 20.6], jaw: [0, 20.6], earN: [-13.4, -27.5], earF: [13.4, -27.5], top: [0, -18.2] }
  };
  // an ear's 7 points (base, side up to the tip, side down to the other base point) turned (deg) and shortened (len)
  // about the middle of its base; the base corners stay on the head. A turned ear is rebuilt side by side: its tip
  // turns about the base's middle, and each side keeps the model's own bend (each handle keeps its angle to the side's
  // chord and its share of it), so a lowered ear is the same small triangle with gently curved sides, never a hook or
  // a bump at its foot. The tip stays ONE node with handles of 2.4 or more (never longer than 0.45 of the side).
  // Unturned (deg 0), the ear is only shortened, as before.
  function earQ(pts, deg, len) {
    var b1 = pts[0], b2 = pts[6], m = lerp(b1, b2, 0.5);
    if (!deg) return pts.map(function (p, i) { if (i === 0 || i === 6) return p; return lerp(m, p, len); });
    var tip = rot(lerp(m, pts[3], len), m, deg), fl = Math.abs(deg) * 0.3;
    function hd(v) { return Math.atan2(v[1], v[0]); }
    // flare: the side the ear leans toward bows out a little more (its foot leaves the head turned outward, so the ear
    // stands off the skull with a clear corner instead of running up it as a hood)
    function side(a, c1, c2, b, na, nb, tipAt, flare) {
      var c0 = sub(b, a), cn = sub(nb, na), k = Math.hypot(cn[0], cn[1]) / Math.hypot(c0[0], c0[1]), r = (hd(cn) - hd(c0)) / RAD, L = Math.hypot(cn[0], cn[1]);
      var h1 = rot(sub(c1, a), [0, 0], r - (flare || 0)), h2 = rot(sub(c2, b), [0, 0], r + (flare || 0));
      h1 = [h1[0] * k, h1[1] * k]; h2 = [h2[0] * k, h2[1] * k];
      function clampH(h, lo) { var l = Math.hypot(h[0], h[1]), l2 = Math.min(Math.max(l, lo), 0.45 * L); return [h[0] * l2 / l, h[1] * l2 / l]; }
      h1 = clampH(h1, tipAt === 0 ? 2.4 : 1.4); h2 = clampH(h2, tipAt === 1 ? 2.4 : 1.4);
      return [na, add(na, h1), add(nb, h2), nb];
    }
    var s1 = side(pts[0], pts[1], pts[2], pts[3], b1, tip, 1, deg < 0 ? fl : 0), s2 = side(pts[3], pts[4], pts[5], pts[6], tip, b2, 0, deg > 0 ? fl : 0);
    return [b1, s1[1], s1[2], tip, s2[1], s2[2], b2];
  }
  // an ear's cubics after its first base point (see earQ)
  function earC(pts, deg, len) {
    var q = earQ(pts, deg, len), out = '';
    for (var i = 1; i + 2 < q.length; i += 3) out += 'C' + P(q[i]) + ' ' + P(q[i + 1]) + ' ' + P(q[i + 2]);
    return out;
  }
  function mirrorEar(pts) { return pts.slice().reverse().map(function (p) { return [-p[0], p[1]]; }); }
  // a whole ear as its own open stroke (the far ear of the 3/4 head): turned and shortened like earC, both feet run on
  // `over` units past the base points along the sides, under the head's top line
  function earPath(pts, deg, len, over) {
    var b1 = pts[0], b2 = pts[pts.length - 1];
    var q = earQ(pts, deg, len);
    var a = add(b1, unit(sub(b1, q[1])), over), z = add(b2, unit(sub(b2, q[q.length - 2])), over);
    // the feet start on the sides' own tangents, so each side is still one cubic (no little joint at the top line)
    var d = 'M' + P(a) + 'C' + P(q[1]) + ' ' + P(q[2]) + ' ' + P(q[3]) + 'C' + P(q[4]) + ' ' + P(q[5]) + ' ' + P(z);
    return d;
  }

  function head(o, K) {
    var front = o.facing === 'f', H = front ? HF : H3, ears = o.ears || [0, 0], el = o.earLen == null ? 1 : o.earLen;
    var s = o.s || 1, flip = o.facing === 'l' ? -1 : 1, tilt = o.tilt || 0, X = o.x || 0, Y = o.y || 0;
    var ca = Math.cos(tilt * RAD), sa = Math.sin(tilt * RAD);
    function toC(p) { var x = p[0] * s * flip, y = p[1] * s; return [X + x * ca - y * sa, Y + x * sa + y * ca]; }
    function toL(p) { var dx = p[0] - X, dy = p[1] - Y; return [(dx * ca + dy * sa) / (s * flip), (-dx * sa + dy * ca) / s]; }
    if (o.anchors) {
      var A = {}; for (var k in H.at) A[k] = toC(H.at[k]);
      A.c = toC([0, 0]); A.nose = toC(H.nose); A.eyeN = toC(H.eyes[0]); A.eyeF = toC(H.eyes[1]); A.s = s;
      // the direction the outline leaves the nape going up (a back line arriving there should come in along it)
      var nv = sub(toC(H3.napeC), toC(H3.at.nape)); A.napeHeading = Math.atan2(nv[1], nv[0]) / RAD;
      return A;
    }
    var line, fillD, list = [], skull = !front && o.skull;
    if (!front) {
      line = H.stub + earC(EAR_N, -(ears[0] || 0), el) + H.top + H.side;
      var farEar = earPath(EAR_F, ears[1] || 0, el, 0.6);
      if (skull) line = H.skull + line.slice(H.stub.length);    // the skull replaces the stub, up to the ear's base
      fillD = line + H.jaw + (skull ? H.jawToNape : H.jawToStub) + 'Z';
      if (o.lead) {
        var start = line.match(/^M(-?[\d.]+) (-?[\d.]+)/), ld = warp(o.lead, toL);
        line = ld.replace(/-?[\d.]+ -?[\d.]+$/, start[1] + ' ' + start[2]) + line.replace(/^M[^C]*/, '');
      }
    } else {
      var fe = earC(EAR_FL, -(ears[0] || 0), el), fr = mirrorEar(EAR_FL), fr2 = earC(fr, ears[1] || 0, el);
      line = H.start + fe + H.top + fr2 + H.side;
      fillD = line + H.jaw;
    }
    // the trail: the outline runs on from the chin's end into a body line (the chest), one stroke, so the corner under
    // the chin is one point and never forks however the pen trembles
    if (o.trail) line += warp(o.trail, toL).replace(/^M[^C]*/, '');
    // the far ear first (its white, its line), then the head's white over its feet, then the head's line
    if (!front) { if (o.fill !== false) list.push(soft(farEar + 'Z')); list.push(K.line(farEar)); }
    if (o.fill !== false) list.push(soft(fillD));
    list.push(K.line(line));
    if (o.chin) list.push(K.line(H.chin));

    // ---- the face: small, low, calm
    var FB = 0.3, kind = o.eyes || 'open', er = o.eyeR || 1;
    var dx = Math.max(-2.2, Math.min(2.2, o.dx || 0)), dy = Math.max(-1.6, Math.min(1.6, o.dy || 0));
    H.eyes.forEach(function (e, i) {
      var x = e[0], y = e[1], r = e[2] * er, hw = r * 1.3, k2 = kind;
      if (kind === 'wink') k2 = i === 1 ? 'happy' : 'open';
      if (k2 === 'closed') list.push(K.line('M' + P([x - hw, y - 0.1]) + 'C' + P([x - hw * 0.5, y + hw * 0.62]) + ' ' + P([x + hw * 0.5, y + hw * 0.62]) + ' ' + P([x + hw, y - 0.1]), { w: 0.9, boil: 0.4 }));
      else if (k2 === 'happy') list.push(K.line('M' + P([x - hw, y + 0.8]) + 'C' + P([x - hw * 0.5, y - hw * 0.6]) + ' ' + P([x + hw * 0.5, y - hw * 0.6]) + ' ' + P([x + hw, y + 0.8]), { w: 0.9, boil: 0.4 }));
      else list.push(K.dot(x + (kind === 'look' ? dx : 0), y + (kind === 'look' ? dy : 0), r));
    });
    var nx = H.nose[0], ny = H.nose[1], nw = 1.4;
    // the nose: a small rounded triangle, point down
    list.push(K.shape('M' + P([nx - nw, ny - 0.75]) + 'C' + P([nx - nw, ny - 1.4]) + ' ' + P([nx + nw, ny - 1.4]) + ' ' + P([nx + nw, ny - 0.75]) +
      'C' + P([nx + nw, ny - 0.1]) + ' ' + P([nx + 0.45, ny + 0.65]) + ' ' + P([nx, ny + 0.65]) + 'C' + P([nx - 0.45, ny + 0.65]) + ' ' + P([nx - nw, ny - 0.1]) + ' ' + P([nx - nw, ny - 0.75]) + 'Z', 'k', { w: 0.6, boil: FB }));
    var m = o.mouth || 'small', j = [nx, ny + 1.75];
    function mouthLine(d, w) { list.push(K.line(d, { w: w || 0.8, boil: FB })); }
    if (m === 'small' || m === 'smile') {
      // a short stem from the nose, then two little strokes splaying out: calm (small) or with their ends turned up a
      // little (smile: a soft upturn, narrower than a ':3', which reads as a sticker at 120 px)
      var up = m === 'smile', sw = up ? 2.3 : 1.95, y1 = up ? 0.85 : 0.9375, y2 = up ? 1.18 : 1.3125, ey = up ? 0.86 : 1.15;
      mouthLine('M' + P([nx, ny + 0.6]) + 'L' + P(j), 0.8);
      [-1, 1].forEach(function (sd) {
        mouthLine('M' + P(j) + 'C' + P([nx + sd * 0.25, j[1] + y1]) + ' ' + P([nx + sd * sw * 0.55, j[1] + y2]) + ' ' + P([nx + sd * sw, j[1] + ey]));
      });
    } else if (m === 'open') {
      list.push(K.shape('M' + P([nx - 2, ny + 1.4]) + 'C' + P([nx - 1.3, ny + 1]) + ' ' + P([nx + 1.3, ny + 1]) + ' ' + P([nx + 2, ny + 1.4]) +
        'C' + P([nx + 1.9, ny + 4.2]) + ' ' + P([nx + 1.1, ny + 5.1]) + ' ' + P([nx, ny + 5.1]) + 'C' + P([nx - 1.1, ny + 5.1]) + ' ' + P([nx - 1.9, ny + 4.2]) + ' ' + P([nx - 2, ny + 1.4]) + 'Z', 'w', { w: 0.85, boil: FB }));
    } else if (m === 'flat') {
      // a short flat line under the nose, no stem (a stem over a bar reads as an anchor at 120 px), its ends a hair low
      mouthLine('M' + P([nx - 1.4, ny + 2.3]) + 'C' + P([nx - 0.5, ny + 2.12]) + ' ' + P([nx + 0.5, ny + 2.12]) + ' ' + P([nx + 1.4, ny + 2.3]), 0.8);
    }
    if (o.whiskers) {
      H.whisk.forEach(function (sd) {
        list.push(K.line('M' + P([sd * 19.4, 4.6]) + 'L' + P([sd * 23.6, 3.6]), { w: 0.8, boil: 0.5 }));
        list.push(K.line('M' + P([sd * 19.2, 7.4]) + 'L' + P([sd * 23.2, 7.9]), { w: 0.8, boil: 0.5 }));
      });
    }
    return K.place(list, { sx: s * flip, sy: s, r: tilt, x: X, y: Y });
  }
  I.part('head', head);

  // ================================================================================================ paw and leg
  /* K.part('paw', o): a leg's end. Its two lines (open at the top, where the leg meets the body) turn in a round U at
     the tip; curved toe ticks. Local frame: the tip at (0, 0), the leg running up (-y); then turned and moved.
       o.x, o.y      where the tip goes                o.r   degrees clockwise (0 points down, 90 left, -90 right)
       o.w           the leg's width (default 11.5; 11 for a far leg, 9.6 to 10.5 for the stretch's front legs)
       o.l1, o.l2    lengths of the left / right line above the U (default 8): the left line is x < 0 before turning
       o.bow         bends both lines sideways (default 0)      o.lean1, o.lean2  move the top of one line sideways
       o.toes        0 | 1 | 2 | 3 ticks (default 2)
       o.toeSide     'tip' (default: the paw seen from the front, ticks rising from the tip) | 'l' | 'r' (seen from the
                     side, like the reference's stretched paws: one small hook on that line just behind the U)
       o.toeIn       how far inside the U the tip ticks start (default 1: clear of the line, so a paw reads as a U with
                     toes and not as a dark comb at 72 to 104 px)     o.toeLen  tick length, share of the half width (0.42)
       o.s           scale            o.fill  false: no white (its top must sit inside a white body anyway) */
  function pawD(w, l1, l2, bow, lean1, lean2) {
    var h = w / 2, b = bow || 0, a1 = lean1 || 0, a2 = lean2 || 0;
    return 'M' + P([-h + a1, -h - l1]) + 'C' + P([-h + b + a1 * 0.35, -h - l1 * 0.66]) + ' ' + P([-h + b * 0.6, -h - l1 * 0.2]) + ' ' + P([-h, -h]) +
      'C' + P([-h, -h * 0.42]) + ' ' + P([-h * 0.56, 0]) + ' 0 0C' + P([h * 0.56, 0]) + ' ' + P([h, -h * 0.42]) + ' ' + P([h, -h]) +
      'C' + P([h + b * 0.6, -h - l2 * 0.2]) + ' ' + P([h + b + a2 * 0.35, -h - l2 * 0.66]) + ' ' + P([h + a2, -h - l2]);
  }
  // toe ticks: small curved hooks, set just inside the paw (inset: how far inside the U they start; len: their length
  // as a share of the half width)
  function toesD(w, n, side, inset, len) {
    var h = w / 2, out = [];
    if (!n) return out;
    if (side === 'l' || side === 'r') {
      var sx = side === 'l' ? 1 : -1, x0 = -sx * h;
      out.push('M' + P([x0, -1.12 * h]) + 'C' + P([x0 + sx * 0.24 * h, -1.14 * h]) + ' ' + P([x0 + sx * 0.44 * h, -1.25 * h]) + ' ' + P([x0 + sx * 0.56 * h, -1.45 * h]));
      return out;
    }
    var xs = n === 1 ? [0.14] : n === 2 ? [-0.3, 0.3] : [-0.5, 0, 0.5];
    xs.forEach(function (f) {
      var L = len == null ? 0.42 : len, x = f * h, y0 = -(h - Math.sqrt(Math.max(0, h * h - x * x))) * 0.92 - (inset == null ? 1 : inset);
      out.push('M' + P([x, y0]) + 'C' + P([x + 0.1, y0 - h * L * 0.4]) + ' ' + P([x - 0.1, y0 - h * L * 0.74]) + ' ' + P([x - 0.3, y0 - h * L]));
    });
    return out;
  }
  function paw(o, K) {
    var w = o.w || 11.5, l1 = o.l1 == null ? 8 : o.l1, l2 = o.l2 == null ? 8 : o.l2, list = [];
    var d = pawD(w, l1, l2, o.bow, o.lean1, o.lean2);
    if (o.fill !== false) list.push(soft(d + 'Z'));
    list.push(K.line(d));
    toesD(w, o.toes == null ? 2 : o.toes, o.toeSide, o.toeIn, o.toeLen).forEach(function (t) { list.push(K.line(t, { w: 0.8, boil: 0.45 })); });
    var s = o.s || 1;
    return K.place(list, { sx: s, sy: s, r: o.r || 0, x: o.x || 0, y: o.y || 0 });
  }
  I.part('paw', paw);

  /* K.part('leg', o): a whole slim front leg, for a raised paw (hello's wave, think's paw at the chin, cheer). Two
     nearly parallel lines from the shoulder (open there: put the shoulder inside the white body, and draw the leg after
     the body so its top melts into it) to a round paw with toe ticks.
       o.from     [x, y] the shoulder, inside the body (the sit part's .at.shoulder)
       o.to       [x, y] the paw's tip           o.w  width (default 11)      o.bow  bends the leg (+ to its left)
       o.short    how much shorter the second line is (default 0: both reach the shoulder; the line on the body's side
                  can stop earlier, e.g. 6)
       o.toes, o.toeSide, o.fill  as for paw */
  I.part('leg', function (o, K) {
    var a = o.from || [0, -40], b = o.to || [0, 0], v = sub(a, b), L = Math.hypot(v[0], v[1]), w = o.w || 11, h = w / 2;
    var r = Math.atan2(v[0], -v[1]) / RAD;
    return paw({ x: b[0], y: b[1], r: r, w: w, l1: L - h, l2: L - h - (o.short || 0), bow: o.bow || 0, toes: o.toes == null ? 2 : o.toes, toeSide: o.toeSide, fill: o.fill }, K);
  });

  // ================================================================================================ tail
  /* K.part('tail', o): a tail of even width with a round tip, open at the root (its root end goes behind or into the
     body: draw the tail before the body if it comes out from behind, or let its root sit inside the white).
       o.nodes    the centre line as pen-tool nodes from the root to the tip: [x, y, heading°, hIn, hOut]. Keep it to 3
                  to 5 nodes: few long curves, a J or an S.
       o.w        width (default 8.6, the reference's)      o.fill  false: no white
       o.sway     degrees: the nodes after the root turn about the root, more toward the tip (a tail sway)
       o.stopA, o.stopB  where each edge starts at the root, in segments along the centre (default 0): an edge that
                  stops a little later reads as going into the body
     The stroke runs up the left edge (the left of the root-to-tip direction), round the tip, back down the right edge. */
  I.part('tail', function (o, K) {
    var nodes = (o.nodes || [[0, 0, 0, 0, 20], [30, -20, -90, 10, 0]]).map(function (n) { return n.slice(); });
    if (o.sway) {
      var root = [nodes[0][0], nodes[0][1]];
      nodes = nodes.map(function (n, i) {
        if (!i) return n; var f = i / (nodes.length - 1), p = rot([n[0], n[1]], root, o.sway * f), q = n.slice();
        q[0] = p[0]; q[1] = p[1]; q[2] = n[2] + o.sway * f; return q;
      });
    }
    var tb = tube(chain(nodes), o.w || 8.6), n2 = tb.a.length;
    var a = cut(tb.a, o.stopA || 0, n2), b = cut(tb.b, o.stopB || 0, n2);
    var d = dOf(a) + cOf(tb.cap) + cOf(revSegs(b)), list = [];
    if (o.fill !== false) list.push(soft(dOf(tb.a) + cOf(tb.cap) + cOf(revSegs(tb.b)) + 'Z'));
    list.push(K.line(d));
    return list;
  });

  // ================================================================================================ sit
  /* K.part('sit', o): the cat sitting tall, 3/4 right, laid out on a 200 x 200 canvas. Strokes, back to front:
       the white of the body and of the far front leg; the HAUNCH crease (the thigh's front edge, an open C); the tail's
       white; the head (white, then ONE long pen stroke: from the tail's top edge, round its tip, back along its
       underside to the haunch, up the back, the neck dipping softly under the round back of the skull, over the ears,
       round the cheek to the chin, and on without lifting the pen down the CHEST, which swells forward and runs down
       the far front leg round its paw); the near front leg (the paw part), both lines open at the top. The tail lies
       in front of the front paws: the near paw stands just behind it (its tip 2.4 above the tail's top line), the far
       paw further back (6.2 above), both with clear paper under them. The standing paws have NO toe ticks (two clean U
       shapes over the tail line read at 72 and 48 px; ticks there turn the feet into a dark knot).
     o.x, o.y     where the near front paw's tip stands (default 100, 184): x 100 puts the cat in the canvas's middle
     o.s          scale (default 1)          o.tall   height factor about the ground (1.02 = the lift's inhale); the head
                                                      rides up with the body, unstretched
     o.head       options for the head (eyes, mouth, ears, earLen, tilt, dx, dy, eyeR, whiskers): position, scale,
                  facing and skull are set by sit. o.headDx, o.headDy move the head a little (units, before scale)
     o.near       false: leave out the near front leg (the pose draws it raised with K.part('leg', { from: at.shoulder }));
                  the far paw then steps forward to where the near one stood (just behind the tail) and its inner line
                  runs up into the body
     o.far        false: leave out the far front leg (the chest line stops at the chest)
     o.tail       false: no tail (the back then ends round the haunch onto the ground); a number: degrees the curl and
                  tip turn about the middle of the tail (+ clockwise)
     o.toes       toe ticks on the standing paws (default 0; keep it 0 unless the paws are drawn well above 132 px)
     The returned list carries .at, points in canvas units: { head (centre), headS, chin, nape, chest (front of the chest),
     shoulder (the root of a raised near front leg, inside the chest: a paw raised beside the head is about 50 units from
     it), farShoulder, nearPaw, farPaw (tips), ground (y), tailTip,
     haunch (the back's fullest point) } */
  var S = {
    G: 184, head: [108, 58], hs: 1.18,
    // the back, from the nape (its first node is replaced by the head's own nape, leaving it along the skull's line) to
    // the tail's underside, 3 cubics with the curvature running on across every node (no elbow, no corner):
    //   the neck: a soft concave dip under the skull, ending in an inflection at the shoulder node (74, 112) that is
    //     nearly straight on both sides (long handles 16 and 24);
    //   ONE long convex sweep over the shoulders and the back, its bend growing slowly into the haunch (fullest at
    //     x 61.4, y 157.6), carried on through the haunch node (63.4, 172) into
    //   an even arc onto the ground (chord heading = the mean of its end headings), easing out into the tail's flat
    //     underside at (90.5, 194.4): the haunch and the tail lie on ONE level ground
    back: [[81.9, 72.7, 80, 0, 17], [74, 112, 113, 16, 24], [63.4, 172, 74, 20, 11.5], [90.5, 194.4, 0, 16, 0]],
    // without a tail, the haunch rounds onto the ground and the line runs on to the near paw, which stands on its end
    backNoTail: [[90.5, 184.6, 0, 9, 12], [112.4, 184.6, 0, 12, 0]],
    // the tail's centre line: from under the haunch, level along the ground (root heading 0, the same y as under the
    // paws) in front of the paws, up in a J at the right. The turn is two even arcs (radius 44, then 21.5 up to the
    // tip) with balanced handles of 7.7, so both edges stay parallel into the round tip: no flat run, no knob on a
    // stick, and long handles that boil smoothly
    tail: [[90.5, 189.4, 0, 0, 8], [114, 189.4, 0, 8, 7.8], [136, 183, -30, 7.8, 7.7], [146.8, 164.4, -90, 7.7, 0]],
    // the tail's top edge starts just behind the near paw (the paw stands on it); behind that the tail's white runs
    // into the body's, with no line: the tail comes out from under the haunch
    tailW: 10, tailStopX: 104,
    // the thigh's front edge: an open C, both ends free, 2 cubics with an even bend (curvature 0.016 to 0.033 all along,
    // no step at the middle node)
    haunch: [[75.5, 121, 27, 0, 13], [94.8, 148.5, 77, 9.5, 10], [93, 177, 112, 10, 0]],
    // the chest: the head's outline runs on from the chin (one stroke: o.trail) at 54 degrees, a hint of the neck's S
    // under the chin, one convex sweep to the chest's fullest point (138.8, 111), then a long soft S down into the far
    // front leg, which runs straight on to its paw (the last node's y is set from the paw)
    chest: [[0, 0, 54, 0, 11], [138.8, 111, 90, 16, 20], [130.1, 172, 90, 24, 0]],
    // the front paws stand on the ground just behind the tail (the tail lies in front of them): the near paw's tip
    // 2.4 above the tail's top edge, so at 104 to 132 px only the round tip of its U meets the tail line, never its
    // whole bottom; the far paw, further back, 6.2 above it. No toe ticks: two clean U shapes at 72 and 48 px
    near: { x: 114, w: 11.5, top1: 127, top2: 139, bow: 0.5, lean1: -1.8, raise: 2.4, toes: 0, toeIn: 1.2 },
    far: { x: 124.6, w: 11, lift: 6.2 }
  };
  // a sampled path's x at a given y (the first crossing), for a far line that stops where a near one covers it
  function xAtY(segs, y) {
    for (var i = 0; i < segs.length; i++) for (var j = 0; j < 60; j++) {
      var p = bez(segs[i], j / 60), q = bez(segs[i], (j + 1) / 60);
      if ((p[1] - y) * (q[1] - y) <= 0 && p[1] !== q[1]) return p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]);
    }
    return null;
  }
  I.part('sit', function (o, K) {
    var s = o.s || 1, tall = o.tall || 1, X = o.x == null ? 100 : o.x, Y = o.y == null ? S.G : o.y, G = S.G;
    function f(p) { return [X + (p[0] - 100) * s, Y + (p[1] - G) * s * tall]; }
    var out = [], hasTail = o.tail !== false, sway = typeof o.tail === 'number' ? o.tail : 0;

    // the head: placed on the body (it rides up with the breath, unstretched)
    var hc = f([S.head[0] + (o.headDx || 0), S.head[1] + (o.headDy || 0)]), ho = {};
    for (var k in (o.head || {})) ho[k] = o.head[k];
    ho.x = hc[0]; ho.y = hc[1]; ho.s = S.hs * s; ho.facing = 'r'; ho.skull = true;
    var HA = head({ x: ho.x, y: ho.y, s: ho.s, tilt: ho.tilt, skull: true, anchors: true }, K);

    // the back, its first node the head's nape, leaving it along the skull's own line (no corner at the nape)
    var bn = S.back.map(function (n) { return n.slice(); });
    if (!hasTail) {
      bn = bn.slice(0, 3).concat(S.backNoTail.map(function (n) { return n.slice(); }));
      if (o.near === false) bn[bn.length - 1][0] = S.far.x - 0.5;     // the ground line runs on to the far paw instead
    }
    var back = mapSegs(chain(bn), f);
    var hdg = (HA.napeHeading + 180) * RAD, h0 = bn[0][4] * s;
    back[0][0] = HA.nape; back[0][1] = add(HA.nape, [Math.cos(hdg), Math.sin(hdg)], h0);

    // the tail: an even band from under the haunch round the front of the paws
    var tb = null, tailTop = null, tn = S.tail.map(function (n) { return n.slice(); });
    if (hasTail) {
      if (sway) {
        var piv = [114, 189.4];
        tn = tn.map(function (n, i) { if (i < 2) return n; var w = i === 2 ? 0.6 : 1, p = rot([n[0], n[1]], piv, sway * w), q = n.slice(); q[0] = p[0]; q[1] = p[1]; q[2] += sway * w; return q; });
      }
      tb = tube(chain(tn), S.tailW);
      tailTop = tb.a;
    }
    var ty = function (x) { return hasTail ? yAt(tailTop, x) : G + 0.6; };     // design units
    var N = S.near, nh = N.w / 2;
    // the near paw stands just behind the tail (see S.near)
    var nearTip = [N.x, ty(N.x) - (hasTail ? N.raise : 0)];
    var farOnTail = o.near === false || !hasTail;
    // with the near leg raised, the far paw steps forward and stands just behind the tail as the near one would
    var farTip = [S.far.x, ty(S.far.x) - (farOnTail ? (hasTail ? N.raise : 0) : S.far.lift)];
    var fh = S.far.w / 2, fx = S.far.x, fy = farTip[1];

    // the chest and the far front leg: the head's outline runs on from the chin's end (o.trail), down the chest and
    // the far front leg, round the far paw: one stroke, so the corner under the chin is one point (no fork, no spur)
    var hA = head({ x: ho.x, y: ho.y, s: ho.s, tilt: ho.tilt, anchors: true }, K), chin = hA.chin;
    var c0 = S.chest[0], cdir = [Math.cos(c0[2] * RAD), Math.sin(c0[2] * RAD)];
    var cn = S.chest.map(function (n) { return n.slice(); });
    cn[cn.length - 1][1] = fy - fh;                                         // the leg runs on to its paw's U
    var chestS = mapSegs(chain(cn), f);
    chestS[0][0] = chin; chestS[0][1] = add(chin, cdir, c0[4] * s);
    // the far paw's U, from the leg's outer line round the tip to its inner side
    var U1 = [[fx + fh, fy - fh], [fx + fh, fy - fh * 0.42], [fx + fh * 0.56, fy], [fx, fy]];
    var U2 = [[fx, fy], [fx - fh * 0.56, fy], [fx - fh, fy - fh * 0.42], [fx - fh, fy - fh]];
    var farSegs;
    if (farOnTail) {
      // the far paw stands on the tail; its inner line runs up into the body
      farSegs = [U1, U2, [[fx - fh, fy - fh], [fx - fh, fy - fh - 14], [fx - fh + 0.4, 152], [fx - fh + 0.8, 140]]];
    } else {
      // the inner side stops where it meets the near leg's right line: a T, 0.35 unit over it (the near paw's white,
      // drawn later, covers that overlap), so no tick and no crossing between the two legs
      var nr = [[nh, -nh], [nh + N.bow * 0.6, -nh - 8], [nh + N.bow, -nh - 20], [nh, -nh - 40]].map(function (q) { return [q[0] + nearTip[0], q[1] + nearTip[1]]; });
      var tEnd = 1;
      for (var j = 0; j <= 200; j++) {
        var q2 = bez(U2, j / 200), xr = xAtY([nr], q2[1]);
        if (xr != null && q2[0] <= xr - 0.35) { tEnd = j / 200; break; }
      }
      farSegs = [U1, split(U2, tEnd)[0]];
    }
    var farD = cOf(mapSegs(farSegs, f));

    // the white of the body: the back, into the tail's band, under the near paw's tip, across the legs, up the chest,
    // into the head
    // (with the near leg raised, the far paw is the standing one: the white runs to it and up its inner line)
    var nt = nearTip, chest2 = chain(cn)[1], legTop = xAtY([chest2], 152) || fx + fh;
    var st = o.near === false ? farTip : nearTip;
    var u152 = chainU(chest2, 152), chestUp = revSegs(cut(chestS, 0, 1 + u152));
    var mid = (o.near === false ? 'L' + P(f([st[0], st[1] - 1.5])) : 'L' + P(f([nt[0], nt[1] - 1.5])) + 'L' + P(f([nt[0], 170]))) +
      'L' + P(f([fx, 168])) + 'L' + P(f([legTop - 0.6, 152])) + 'L' + P(chestUp[0][0]);
    var bodyD = dOf(back) + mid;
    if (hasTail) {
      // inside the tail's band up to where its top line starts, then ON that line to the standing paw's tip, and
      // straight up to the tip: the only white edge with no line over it is that 2.4-unit gap, hidden by the pen up
      // to 200 px
      var tr = S.tail[0][0] + 3, edge = 'L' + P(f([tr, ty(tr) + 1])) + 'L' + P(f([S.tailStopX, ty(S.tailStopX) + 0.4]));
      for (var ex = S.tailStopX + 3; ex < st[0] - 0.3; ex += 3) edge += 'L' + P(f([ex, ty(ex)]));
      edge += 'L' + P(f([st[0] - 0.3, ty(st[0] - 0.3)])) + 'L' + P(f([st[0] - 0.3, st[1] - 0.3]));
      bodyD = dOf(back) + edge + mid;
    }
    bodyD += cOf(chestUp) + 'L' + P(f([112, 74])) + 'Z';
    out.push(soft(bodyD));
    var trail;
    if (o.far !== false) {
      // the far leg's white (before the head: its line is the head's trail): from the leg's outer line at y 150,
      // round the paw, up behind the near leg
      var lastS = chestS[chestS.length - 1], u150 = chainU(chest2, 150);
      var fEnd = farSegs[farSegs.length - 1][3];
      out.push(soft(dOf(cut([lastS], u150, 1)) + farD + 'L' + P(f([fEnd[0] - 1.5, fEnd[1] - 2])) + 'L' + P(f([fx - fh, 150])) + 'Z'));
      trail = dOf(chestS) + farD;
    } else trail = dOf(chestS.slice(0, 1).concat(cut(chestS.slice(1), 0, chainU(chest2, 150))));
    out.push(K.line(dOf(mapSegs(chain(S.haunch), f))));

    // the long stroke: tail top (from inside the rump) -> round the tip -> tail underside -> up the back -> the head
    var lead;
    if (hasTail) {
      var tbC = { a: mapSegs(tb.a, f), b: mapSegs(tb.b, f), cap: mapSegs(tb.cap, f) };
      out.push(soft(dOf(tbC.a) + cOf(tbC.cap) + cOf(revSegs(tbC.b)) + 'Z'));
      var u0 = 0; for (var q = 0; q <= 1; q += 0.01) if (kit_bez(tb.a[0], q)[0] < S.tailStopX) u0 = q;
      lead = dOf(cut(tbC.a, u0, tbC.a.length)) + cOf(tbC.cap) + cOf(revSegs(tbC.b)) + cOf(revSegs(back));
    } else lead = dOf(revSegs(back));
    ho.lead = lead; ho.trail = trail;
    out = out.concat(head(ho, K));
    if (o.far !== false && o.toes) toesD(S.far.w, o.toes, 'tip', S.near.toeIn).forEach(function (t) { out.push(K.line(warp(K.xf(t, { x: farTip[0], y: farTip[1] }), f), { w: 0.8, boil: 0.45 })); });
    if (o.near !== false) {
      out = out.concat(move(paw({ x: nt[0], y: nt[1], w: N.w, l1: nt[1] - nh - N.top1, l2: nt[1] - nh - N.top2, bow: N.bow, lean1: N.lean1, toes: o.toes || N.toes, toeIn: N.toeIn }, K), f));
    }
    out.at = {
      head: hc, headS: S.hs * s, chin: chin, nape: HA.nape, chest: f([138.8, 111]), shoulder: f([113, 112]), farShoulder: f([126, 118]),
      nearPaw: f(nt), farPaw: f(farTip), ground: f(nt)[1], tailTip: hasTail ? mapSegs(tb.cap, f)[0][3] : null, haunch: f([61.4, 157.6])
    };
    return out;
  });
  // where along one segment (0..1) it first reaches a given y
  function chainU(seg, y) { for (var j = 0; j <= 200; j++) if (bez(seg, j / 200)[1] >= y) return j / 200; return 1; }
})();

// ---------------------------------------------------------------- poses-model
/* Health Class cat · the model sheet poses: `stretch` (the reference pose itself, 220 x 150) and `lift` (sitting tall,
   200 x 200), built on parts.js. Load after engine.js and parts.js. */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit, warp = kit.warp, rot = kit.rot, sstep = kit.sstep;

  // ---------------------------------------------------------------------------------------------- stretch
  /* The reference pose, traced from ref-amy-4x.png (x = (px - 32) * 0.2775 + 10, y = (px - 668) * 0.2775 + 142) and
     redrawn in few clean curves. Five pen strokes, each one line like the reference's:
       BACK  the tail's inner line (starting ON the near hind leg's back line, a T), round the tip, up the tail's outer
             line, over the hips and down the back until it meets the head's ear stub. Only this stroke sways.
       LEGA  the near hind leg: from inside the hip down the thigh and the leg's back line (one unswayed stroke, so the
             tail's T can never fork from it), the paw with its heel, its front line up past the belly (the thigh
             crease, open at the top)
       LEGB  the far hind leg: from the belly down, the paw, back up into the belly
       BELLY from the thigh along the belly to the lower front paw, round its tip, up under the upper leg
       ARM   the upper front leg: from the chest under the chin to its paw and back along its top to the head
     Whites: the body's and the tail's first; then the near hind leg's own white, after the far hind leg, the tail and the
     belly (all three end ON its lines, a T each, and it hides their 0.4-unit overshoots); the upper foreleg's own white
     after the belly (whose end runs under the arm line). MODEL.md section 5, rule 4.
     Motion: the hips rise 2 units and settle (1 - cos), the tail sways ±5° about its root (cos: slow, fast, slow, and
     the extremes land on frames, the tip moving at most 2.7 units a frame), a blink on frame 5. */
  var ST = {
    // the tail's underside starts 0.4 unit inside the near hind leg (legA's white, drawn after it, hides that end)
    back: 'M41 75.3C38.2 78.95 26.4 92.4 18.6 92.9C15.2 93.1 11.8 91.2 11.8 88.1' +
      'C11.8 85.6 13.6 83.6 16.4 81.9C19.8 79.6 25.5 72.6 30.5 59.5C37.2 42.8 40 28 63.6 28' +
      'C83.6 28 91.2 46.3 99.5 64.5C104.5 75.4 114.8 95.1 128.8 96.5',
    legA: 'M46.4 50.2C44 56.5 40.6 66 40.6 75C40.6 82 43 90.5 42.9 101.5C42.8 112.5 42.2 121.5 44.2 127.5C45.8 131.5 55 132.6 58.2 128.6' +
      'C59.4 126.6 58.2 124.8 56.4 123.8C54.6 122.8 54.1 120.8 54.1 117.6C54.1 108 64.5 87.5 71.1 80.1',
    legB: 'M59.3 99.8C58.5 106 59.2 116 61 122.5C63 128.5 73.5 131.5 77.6 127.9C79.3 126.4 78.8 123.3 76.4 122.6' +
      'C73.4 121.7 71.6 120.5 71.6 116C71.6 111 71.8 106.5 72.2 102.9',
    // the belly starts ON the thigh line (a T, no spur past it) and ends 0.4 unit past the upper foreleg's line, under
    // its white
    belly: 'M62.96 92.44C75.4 105.15 95.5 120.6 112.1 127.6C132.3 136.2 156.9 138.8 178.7 141.9' +
      'C183.4 142.6 188.4 140.6 188.4 136.8C188.4 135 187.9 133.7 187.1 132.6',
    arm: 'M132.1 117.3C154.3 126.4 179.7 133.9 203.7 134.6C207 134.7 210.8 132.6 210.7 129.4' +
      'C210.6 126.9 208.4 125.6 205.3 125C193.5 123 180.5 120.6 168.9 117.4',
    // the toe ticks: small curved hooks rising from the paw's underside just behind its round tip, as in the reference
    toeA: 'M205.5 134.4C205.4 133.3 205 132.2 204 131.3', toeB: 'M181.7 141.8C181.5 140.7 181 139.7 180 138.9',
    // the upper foreleg's own white, right of the head (x 172 on): drawn after the belly, it hides the belly's T under
    // the arm line; its straight left edge lies on the body's white
    armW: 'M172 130.26C182.58 132.71 193.27 134.3 203.7 134.6C207 134.7 210.8 132.6 210.7 129.4C210.6 126.9 208.4 125.6 205.3 125C194.54 123.18 182.78 121.02 172 118.23Z',
    // the white of the cat under its lines: the silhouette along the very same curves (the free tail apart, so it can
    // swing with its lines), and the tail, reaching into the hip so the two whites overlap without a seam
    fillBody: 'M40.6 75L30.5 59.5C37.2 42.8 40 28 63.6 28C83.6 28 91.2 46.3 99.5 64.5C104.5 75.4 114.8 95.1 128.8 96.5' +
      'L150 102L168.9 117.4C180.5 120.6 193.5 123 205.3 125C208.4 125.6 210.6 126.9 210.7 129.4C210.8 132.6 207 134.7 203.7 134.6' +
      'C198.41 134.45 193.05 133.96 187.67 133.2L187.1 132.6C187.9 133.7 188.4 135 188.4 136.8C188.4 140.6 183.4 142.6 178.7 141.9' +
      'C156.9 138.8 132.3 136.2 112.1 127.6C99.53 122.3 84.89 112.12 73.05 101.93L72.2 102.9C71.8 106.5 71.6 111 71.6 116' +
      'C71.6 120.5 73.4 121.7 76.4 122.6C78.8 123.3 79.3 126.4 77.6 127.9C73.5 131.5 63 128.5 61 122.5C59.2 116 58.5 106 59.3 99.8' +
      'L59.3 99.81C56.29 106.49 54.1 113.19 54.1 117.6C54.1 120.8 54.6 122.8 56.4 123.8C58.2 124.8 59.4 126.6 58.2 128.6' +
      'C55 132.6 45.8 131.5 44.2 127.5C42.2 121.5 42.8 112.5 42.9 101.5C43 90.5 40.6 82 40.6 75Z',
    fillTail: 'M46.4 50.2C44 56.5 40.6 66 40.6 75L41 75.3C38.2 78.95 26.4 92.4 18.6 92.9C15.2 93.1 11.8 91.2 11.8 88.1' +
      'C11.8 85.6 13.6 83.6 16.4 81.9C19.8 79.6 25.5 72.6 30.5 59.5L40 47L48 47Z'
  };
  I.define('stretch', { w: 220, h: 150, draw: function (t, K) {
    // the hips rise 2 units and settle (the feet and the head stay), the tail swings about where it leaves the thigh
    var lift = 1 - Math.cos(t * K.TAU), sway = K.wave(t, 5, 0.25), pivot = [39.8, 76];
    function hips(p) { var w = (1 - sstep(96, 134, p[0])) * Math.max(0, Math.min(1, (128 - p[1]) / 92)); return [p[0], p[1] - lift * w]; }
    // the whole J (both its lines, from the root at the pivot to the tip) turns rigidly; the turn fades out only where
    // the outer line runs up into the hips (y 72 to 60), so no line bends near the root
    function tail(p) { var w = sstep(60, 72, p[1]) * sstep(47, 41, p[0]); return w ? rot(p, pivot, sway * w) : p; }
    var body = function (d) { return warp(d, hips); }, tl = function (d) { return warp(warp(d, tail), hips); };
    // order: the whites, the far hind leg, the tail and back, the belly; then the near hind leg's own white (it hides
    // the far leg's T, the tail's T and the belly's T on its lines) and its line; the head; the upper foreleg's white
    // (it hides the belly's end) and its line
    return [
      kit.fill(body(ST.fillBody)), kit.fill(tl(ST.fillTail)),
      K.line(body(ST.legB)),
      K.line(tl(ST.back)),
      K.line(body(ST.belly)), K.line(ST.toeB, { w: 0.8, boil: 0.45 }),
      kit.fill(body(ST.legA + 'Z')),
      K.line(body(ST.legA))
    ].concat(K.part('head', { x: 147.64, y: 110.92, eyes: kit.blink(t) ? 'closed' : 'open' }), [
      kit.fill(ST.armW), K.line(ST.arm), K.line(ST.toeA, { w: 0.8, boil: 0.45 })
    ]);
  } });

  // ---------------------------------------------------------------------------------------------- lift
  /* Sitting tall, 3/4, eyes closed, calm, front paws together, the tail curled round the feet: the sit part as it is.
     The lift: the body grows 2% taller on the inhale (about the ground, symmetric ease); the head rides up with it. */
  I.define('lift', { w: 200, h: 200, draw: function (t, K) {
    var tall = 1.01 - 0.01 * Math.cos(t * K.TAU);
    return K.part('sit', { y: 182, tall: tall, head: { eyes: 'closed', tilt: 3 } });
  } });
})();

// ---------------------------------------------------------------- poses-a
/* Health Class cat · group A, sitting gestures: hello, think, worry (200 x 200 each), built on parts.js.
   Load after engine.js and parts.js:
     node render.mjs --files engine.js,parts.js,poses-model.js,poses-a.js --poses hello,think,worry --out out/poses-a.png
   All three stand on the model's `sit` (same head, face, pen, paws and proportions as `lift`), placed like the lift
   (y 182). The face, the mouths ('smile', 'small', 'flat') and the ears (worry's lowered pair: `ears`, `earLen`) all
   come from the head part, so the three share one face with every other drawing. The gestures hang on the sit: hello
   and think leave out the near front leg (`near: false`, the far paw steps forward) and draw it raised; worry is the
   sit itself, smaller and hunched.
   Local helpers add only what the parts do not have: a jointed raised leg ending in a round U with two curved toe
   hooks; the neck re-solved for a head turned well forward (think's tilt 10), so the nape keeps the lift's soft S and
   dip; one eye dot nudged inside the cheek (head units, never up toward the ears); worry's chest re-run from a sunk
   chin and its rounded shoulders; steadier round ends (each U one cubic) so no paw or tail tip points under the boil.
*/
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit, P = kit.P, RAD = Math.PI / 180;

  function vec(deg, l) { l = l == null ? 1 : l; return [Math.cos(deg * RAD) * l, Math.sin(deg * RAD) * l]; }
  function add(p, v, k) { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function len(v) { return Math.hypot(v[0], v[1]); }
  function unit(v) { var l = len(v) || 1; return [v[0] / l, v[1] / l]; }
  function leftOf(t) { return [t[1], -t[0]]; }
  function hdg(v) { return Math.atan2(v[1], v[0]) / RAD; }
  function ang(d) { while (d > 180) d -= 360; while (d < -180) d += 360; return d; }
  function near(a, b) { return len(sub(a, b)) < 0.05; }
  function bez(s, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * s[0][0] + b * s[1][0] + c * s[2][0] + d * s[3][0], a * s[0][1] + b * s[1][1] + c * s[2][1] + d * s[3][1]];
  }
  function withD(st, d) { var c = {}; for (var k in st) c[k] = st[k]; c.d = d; return c; }
  function keepAt(list, from) { list.at = from.at; return list; }

  // ------------------------------------------------------------------------------------------ the sit's head
  // where a head-local point lands on the canvas (the sit places the head at .at.head, scale .at.headS, turned `tilt`)
  function headFrame(cat, tilt) {
    var X = cat.at.head[0], Y = cat.at.head[1], s = cat.at.headS, ca = Math.cos(tilt * RAD), sa = Math.sin(tilt * RAD);
    return { toC: function (p) { var x = p[0] * s, y = p[1] * s; return [X + x * ca - y * sa, Y + x * sa + y * ca]; } };
  }
  // the sit's long stroke (tail, back, head, chest, far leg): the line with a segment ending at the nape
  function mainLine(cat) {
    for (var i = 0; i < cat.length; i++) {
      if (cat[i].t !== 'line') continue;
      var sg = kit.segs(cat[i].d);
      for (var k = 0; k + 5 < sg.length; k++) if (near(sg[k][3], cat.at.nape)) return i;
    }
    return -1;
  }
  /* One eye moved inside the head (head units; the head part's own 'look' moves both): the eye strokes follow the
     head's long line (near eye, then far eye), dots or lids alike. Used to keep the far eye 6 canvas units inside the
     cheek, so it never fuses with the cheek line at 72 px. */
  function nudgeEye(cat, tilt, which, d) {
    var i = mainLine(cat), F = headFrame(cat, tilt), o = F.toC([0, 0]), v = sub(F.toC(d), o), out = cat.slice();
    var st = cat[i + 1 + which], c = {};
    for (var k in st) c[k] = st[k];
    if (st.t === 'dot') { c.x += v[0]; c.y += v[1]; } else c.d = K0.xf(st.d, { x: v[0], y: v[1] });
    out[i + 1 + which] = c;
    return keepAt(out, cat);
  }
  var K0 = I.K;
  /* The neck re-solved for a head turned forward (tilt above the lift's 3): turning the head turns the back of its
     skull, so its tangent at the nape points straight down and the sit's neck leaves it with no dip (a flat column
     under the skull). Here the skull's own round runs on past the nape for `run` units (an arc turning `turn` degrees
     more, the bend of the skull's line at the nape), to J, an inflection nearly straight on both sides; then the neck
     dips in and sweeps to the shoulder, arriving there along the sit's own handle. The nape stays where the head's
     skull starts, its tangent continuous; the body's white (its first segment is the neck) follows the new line. */
  function neck(cat, o) {
    if (!o) return cat;
    var i = mainLine(cat), segs = kit.segs(cat[i].d), N = cat.at.nape, k = -1;
    for (var j = 0; j < segs.length; j++) if (near(segs[j][3], N)) { k = j; break; }
    if (k < 0) return cat;
    var sk = segs[k + 1], tN = unit(sub(sk[1], sk[0])), hDown = hdg(tN) + 180, th = o.turn, L = o.run;
    var R = L / (th * RAD), ch = 2 * R * Math.sin(th * RAD / 2), J = add(N, vec(hDown - th / 2, ch)), uJ = vec(hDown - th + 180);
    var A = segs[k], S = A[0], segA = [S, A[1], add(J, uJ, -len(sub(J, S)) * o.a), J];
    var segB = [J, add(J, uJ, ch * o.b), add(N, tN, -ch * o.c), N];
    segs.splice(k, 1, segA, segB);
    var out = cat.slice();
    out[i] = withD(cat[i], kit.d(segs));
    var ws = kit.segs(cat[0].d.replace(/Z$/, ''));
    if (near(ws[0][0], N)) { ws.splice(0, 1, kit.rev([segB])[0], kit.rev([segA])[0]); out[0] = withD(cat[0], kit.d(ws, true)); }
    return keepAt(out, cat);
  }
  /* The speck of paper between the head's white and the body's white under the jaw (the jaw corner and the body's
     straight closing edge leave a pinhole there at some tilts): one more white, inside the body, under every line,
     from 0.6 unit inside the nape back under the jaw. `turn` turns it with the head (tilt minus the lift's 3). */
  function napePatch(cat, s, turn) {
    s = s || 1;
    var n = cat.at.nape, c = Math.cos((turn || 0) * RAD), sn = Math.sin((turn || 0) * RAD);
    var q = function (dx, dy) { dx *= s; dy *= s; return P([n[0] + dx * c - dy * sn, n[1] + dx * sn + dy * c]); };
    var patch = kit.fill('M' + q(0.6, -1.6) + 'L' + q(7, -7) + 'L' + q(30, -7) + 'L' + q(30, 8) + 'L' + q(7, 8) + 'L' + q(7, 0.35) + 'L' + q(0.75, 0.35) + 'Z');
    var out = cat.slice(0, 1).concat([patch], cat.slice(1));
    return keepAt(out, cat);
  }

  /* Steadier ends under the tremble (the engine moves every point on its own, so a round end built of two cubics
     meeting at its tip can come to a point on one frame): every round U of the sit's lines (the paws, the tail's tip)
     is drawn as ONE cubic (handles 2/3 of its width: the same half circle within 2%), and the tail's top edge, a short
     flat run then the curve, as one cubic, so it cannot nick at the node between them. The whites keep their own
     edges, inside the pen. */
  function steady(cat) {
    var out = cat.slice();
    function capOne(sg) {
      var res = [];
      for (var k = 0; k < sg.length; k++) {
        var a = sg[k], b = sg[k + 1];
        if (b && near(a[3], b[0])) {
          var w = len(sub(a[0], b[3])), m = [(a[0][0] + b[3][0]) / 2, (a[0][1] + b[3][1]) / 2];
          var t0 = unit(sub(a[1], a[0])), t3 = unit(sub(b[3], b[2]));
          if (w > 6 && w < 14 && Math.abs(len(sub(a[3], m)) - w / 2) < 0.35 && t0[0] * t3[0] + t0[1] * t3[1] < -0.97) {
            res.push([a[0], add(a[0], t0, w * 2 / 3), add(b[3], t3, -w * 2 / 3), b[3]]); k++; continue;
          }
        }
        res.push(a);
      }
      return res;
    }
    var mi = mainLine(cat);
    out.forEach(function (st, i) {
      if (st.t !== 'line' || st.w !== 1) return;
      var sg = capOne(kit.segs(st.d));
      if (i === mi && sg.length > 2) {
        var a = sg[0], b = sg[1], ta = unit(sub(a[1], a[0])), tb = unit(sub(b[1], b[0]));
        // the tail's top edge: a flat run (heading 0 at both its ends) then the curve
        if (Math.abs(ta[1]) < 0.02 && Math.abs(tb[1]) < 0.02 && len(sub(a[3], a[0])) < 14) {
          var c = len(sub(b[3], a[0])), te = unit(sub(b[3], b[2]));
          sg.splice(0, 2, [a[0], add(a[0], ta, c * 0.44), add(b[3], te, -len(sub(b[3], b[2]))), b[3]]);
        }
      }
      out[i] = withD(st, kit.d(sg));
    });
    return keepAt(out, cat);
  }

  // ------------------------------------------------------------------------------------------ a raised leg
  /* A raised front leg along pen-tool centre nodes [x, y, heading, hIn, hOut] (shoulder, elbow, ..., the paw's centre),
     its width changing node to node (a taper toward the wrist), ending in a round U (the paw part's handles, 0.58 and
     0.56 of the half width). The two edges are the centre's nodes moved out sideways, their handles stretched or
     shortened by the bend (so they stay parallel round the elbow). Open at the top: each edge starts at its own depth
     inside the body (stopL, stopR: where along the centre, in segments). */
  function limb(K, nodes, widths, o) {
    o = o || {};
    var n = nodes.length, L = [], R = [];
    for (var i = 0; i < n; i++) {
      var nd = nodes[i], t = vec(nd[2]), nl = leftOf(t), h = widths[i] / 2;
      L.push([nd[0] + nl[0] * h, nd[1] + nl[1] * h, nd[2], nd[3], nd[4]]);
      R.push([nd[0] - nl[0] * h, nd[1] - nl[1] * h, nd[2], nd[3], nd[4]]);
    }
    for (var j = 0; j + 1 < n; j++) {
      var A = nodes[j], B = nodes[j + 1], c = len(sub([B[0], B[1]], [A[0], A[1]])), k = ang(B[2] - A[2]) * RAD / c;
      var hm = (widths[j] + widths[j + 1]) / 4;
      L[j][4] = A[4] * (1 + hm * k); L[j + 1][3] = B[3] * (1 + hm * k);
      R[j][4] = A[4] * (1 - hm * k); R[j + 1][3] = B[3] * (1 - hm * k);
    }
    var segL = kit.chain(L), segR = kit.chain(R);
    var C = [nodes[n - 1][0], nodes[n - 1][1]], u = vec(nodes[n - 1][2]), nl2 = leftOf(u), hp = widths[n - 1] / 2;
    var Ap = add(C, nl2, hp), Bp = add(C, nl2, -hp), T = add(C, u, hp);
    var cap = [[Ap, add(Ap, u, 0.58 * hp), add(T, nl2, 0.56 * hp), T], [T, add(T, nl2, -0.56 * hp), add(Bp, u, 0.58 * hp), Bp]];
    var whiteD = kit.d(segL.concat(cap, kit.rev(segR))) + 'Z';
    var lineD = kit.d(kit.cut(segL, o.stopL || 0, segL.length).concat(cap, kit.rev(kit.cut(segR, o.stopR || 0, segR.length))));
    var list = [kit.fill(whiteD), K.line(lineD)];
    if (o.toes) list = list.concat(toeHooks(K, T, u, hp, o.toes));
    return { list: list, tip: T, segL: segL, segR: segR };
  }
  /* A raised paw's two toe ticks: small curved hooks set `o.inset` inside the U (1.3), each leaning a little away
     from the leg's axis (splayed like toes) and curling outward at its end; weight 0.8, a quiet boil. */
  function toeHooks(K, tip, u, hp, o) {
    o = o === true || typeof o !== 'object' ? {} : o;
    var inset = o.inset == null ? 1.3 : o.inset, Lh = (o.len == null ? 0.5 : o.len) * hp, spread = o.spread == null ? 9 : o.spread, out = [];
    [-1, 1].forEach(function (sd) {
      var x = sd * 0.34 * hp, rim = hp - Math.sqrt(Math.max(0, hp * hp - x * x));
      // local frame: the tip at (0, 0), the leg running up (-y); the hook leans `spread` degrees outward and curls out
      var a = (90 + sd * spread) * RAD, dir = [-Math.cos(a), -Math.sin(a)];
      var p0 = [x, -(rim * 0.92 + inset)], p3 = add(p0, dir, Lh), side = [sd, 0];
      var p1 = add(p0, dir, Lh * 0.38), p2 = add(add(p0, dir, Lh * 0.72), side, 0.12 * Lh), p3b = add(p3, side, 0.34 * Lh);
      // to the canvas: local x runs across the paw (toward -leftOf(u)), local -y back up the leg (-u)
      var right = [-leftOf(u)[0], -leftOf(u)[1]];
      var C = function (p) { return [tip[0] + right[0] * p[0] + u[0] * p[1], tip[1] + right[1] * p[0] + u[1] * p[1]]; };
      out.push(K.line('M' + P(C(p0)) + 'C' + P(C(p1)) + ' ' + P(C(p2)) + ' ' + P(C(p3b)), { w: 0.8, boil: 0.4 }));
    });
    return out;
  }
  // where along an edge (in segments) the line should start so that it runs `d` units inside the body before it
  // crosses the chest's outline (xOut(y): the outline's x at that height)
  function startInside(segs, xOut, d) {
    var pts = [], acc = 0, prev = null;
    for (var i = 0; i < segs.length; i++) for (var j = 0; j <= 40; j++) {
      var p = bez(segs[i], j / 40); if (prev) acc += len(sub(p, prev)); prev = p; pts.push({ u: i + j / 40, p: p, s: acc });
    }
    var cross = null;
    for (var q = 0; q < pts.length; q++) if (pts[q].p[0] > xOut(pts[q].p[1])) { cross = pts[q]; break; }
    if (!cross) return 0;
    for (var r = pts.length - 1; r >= 0; r--) if (pts[r].s <= cross.s - d) return pts[r].u;
    return 0;
  }
  // the sit's chest outline (the main line from the chin down past the chest's fullest point): its x at a height
  function chestOutline(cat) {
    var i = mainLine(cat), segs = kit.segs(cat[i].d), ch = cat.at.chin, k = -1;
    for (var j = 0; j < segs.length; j++) if (near(segs[j][0], ch)) { k = j; break; }
    var pts = []; segs.slice(k, k + 2).forEach(function (s) { for (var q = 0; q <= 60; q++) pts.push(bez(s, q / 60)); });
    return function (y) {
      if (y <= ch[1]) return ch[0];
      for (var a = 0; a + 1 < pts.length; a++) if ((pts[a][1] - y) * (pts[a + 1][1] - y) <= 0 && pts[a][1] !== pts[a + 1][1]) return pts[a][0] + (pts[a + 1][0] - pts[a][0]) * (y - pts[a][1]) / (pts[a + 1][1] - pts[a][1]);
      return pts[pts.length - 1][0];
    };
  }

  // ---------------------------------------------------------------------------------------------- hello
  /* Sitting 3/4, the near front paw raised beside the head, waving; the head part's smile, the head turned 3 degrees
     toward the paw (the lift's own tilt and neck). The raised leg grows from the shoulder low in the chest (its top
     edge runs 3 units over the chest's white past the T, its underside 11 units: the armpit), bends clearly at the
     elbow (40 to 60 degrees all through the wave), tapers toward the wrist and ends in a round U with two small curved
     toe hooks. Motion: the forearm waves +-11 degrees about the elbow (frame 1 out to the side, frame 4 upright, 6 units
     of paper at least between the paw and the cheek) while the upper arm stays still, and the paw trails the forearm
     by half a frame at the wrist. One blink, on frame 5; the tail stays still. */
  var HELLO = { tilt: 3, root: [118, 116], upper: 37, upperDeg: -32, fore: 36, foreDeg: -81, wave: 11, cock: -4, widths: [11.6, 11.1, 10.2],
    eh: 0.28, top: 3, under: 11, farEye: [-1.1, 0] };
  I.define('hello', { w: 200, h: 200, draw: function (t, K) {
    var H = HELLO;
    var cat = K.part('sit', { y: 182, near: false, head: { eyes: kit.blink(t) ? 'closed' : 'open', mouth: 'smile', tilt: H.tilt } });
    cat = napePatch(steady(nudgeEye(cat, H.tilt, 1, H.farEye)), 1, 0);
    var sw = function (tt) { return H.wave * Math.cos(tt * K.TAU); };
    var aU = H.upperDeg, aF = H.foreDeg + sw(t), aP = H.foreDeg + sw(t - 1 / 12) + H.cock;
    var E = add(H.root, vec(aU, H.upper)), W = add(E, vec(aF, H.fore));
    var nodes = [[H.root[0], H.root[1], aU, 0, H.upper * 0.45], [E[0], E[1], (aU + aF) / 2, H.upper * H.eh, H.fore * H.eh], [W[0], W[1], aP, H.fore * 0.45, 0]];
    var probe = limb(K, nodes, H.widths), xo = chestOutline(cat);
    var arm = limb(K, nodes, H.widths, { toes: true, stopL: startInside(probe.segL, xo, H.top), stopR: startInside(probe.segR, xo, H.under) });
    return keepAt(cat.concat(arm.list), cat);
  } });

  // ---------------------------------------------------------------------------------------------- think
  /* The near front leg folded, its paw under the chin. ONE stroke, open where it goes into the body: from 14 units
     inside the chest along the upper arm's underside, running down and forward into the elbow (its lowest point, about
     y 126: a fold pointing down and forward), round the elbow (a firm turn of radius 4.2, smaller than the paw's U of
     4.75, so the two ends never match), up the forearm's outer side (a slight convex bow, tapering from 11.5 at the
     elbow to 9.5 at the wrist), round the paw's U, down the forearm's inner side, ending inside the body in the crook
     at y 107.5. The paw's white covers the chin's corner (the cheek line ends ON the paw: a covered T); the chest line
     meets the elbow's underside as a T under its white. No toe ticks: the paw presses against the chin. */
  var THINK = {
    tilt: 10, look: [0, -1.2], farEye: [-1.2, 0], neck: { turn: 7, run: 12, a: 0.4, b: 0.42, c: 0.52 },
    // the outer side: start inside the chest, the underside down into the elbow, the elbow's turn, the forearm's
    // outer side up to the wrist (pen-tool nodes; the wrist node is added from the paw)
    outer: [[125.3, 122.93, 16, 0, 5.1], [139.36, 125.82, 6, 5.1, 2.55], [144, 121.5, -92, 2.55, 15]], wristH: 15,
    paw: [124.5, 80.5], pawDeg: -118, pawW: 9.5, crook: [130, 107.5], crookDeg: 72, crookH: [9, 9]
  };
  function thinkArm(K) {
    var A = THINK, u = vec(A.pawDeg), nl = leftOf(u), h = A.pawW / 2, C = A.paw;
    var Wr = add(C, nl, -h), Wl = add(C, nl, h), T = add(C, u, h);
    var outer = kit.chain(A.outer.concat([[Wr[0], Wr[1], A.pawDeg, A.wristH, 0]]));
    var cap = [[Wr, add(Wr, u, 0.58 * h), add(T, nl, -0.56 * h), T], [T, add(T, nl, 0.56 * h), add(Wl, u, 0.58 * h), Wl]];
    var inner = kit.chain([[Wl[0], Wl[1], A.pawDeg + 180, 0, A.crookH[0]], [A.crook[0], A.crook[1], A.crookDeg, A.crookH[1], 0]]);
    var d = kit.d(outer.concat(cap, inner));
    return [kit.fill(d + 'L' + P([A.crook[0] - 6, A.crook[1] + 12]) + 'L' + P(A.outer[0]) + 'Z'), K.line(d)];
  }
  // the question mark, in the pen: the hook over the top (two even arcs), then ONE soft S down into the short stem
  // (the inflection half way down, the hook descending at about 115 degrees there), and a dot
  var QM = kit.d(kit.chain([[147.6, 35.6, -80, 0, 3.85], [154.8, 28.4, 0, 3.85, 3.35], [160.9, 34.4, 90, 3.35, 5.6], [157.9, 46.3, 90, 5.6, 0]]));
  var QM_DOT = [157.9, 51.6];
  /* Sitting, the head cocked to one side (tilt 10, the model's quizzical tilt; the neck re-solved for it: a 1.9-unit
     dip), the near paw folded under the chin, the eyes glancing up within the head part's own look (dx 0, dy -1.2; the
     far dot 1.2 further inside the cheek) toward a small question mark beside the head. Motion: the question mark bobs
     +-2 units (cos: the extremes land on frames). */
  I.define('think', { w: 200, h: 200, draw: function (t, K) {
    var A = THINK;
    var cat = K.part('sit', { y: 182, near: false, head: { eyes: 'look', dx: A.look[0], dy: A.look[1], mouth: 'small', tilt: A.tilt } });
    cat = napePatch(steady(neck(nudgeEye(cat, A.tilt, 1, A.farEye), A.neck)), 1, A.tilt - 3);
    var bob = K.wave(t, 2, 0.25);
    return keepAt(cat.concat(thinkArm(K), [K.line(K.xf(QM, { y: bob })), K.dot(QM_DOT[0], QM_DOT[1] + bob, 1.3)]), cat);
  } });

  // ---------------------------------------------------------------------------------------------- worry
  function split(s, t) {
    var l = function (a, b) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
    var a = l(s[0], s[1]), b = l(s[1], s[2]), c = l(s[2], s[3]), d = l(a, b), e = l(b, c), f = l(d, e);
    return [[s[0], a, d, f], [f, e, c, s[3]]];
  }
  function uAtY(s, y) { for (var j = 0; j <= 400; j++) if (bez(s, j / 400)[1] >= y) return j / 400; return 1; }
  /* The chest re-run from the chin for a sunk head: ONE even convex sweep from the chin (leaving it at `dep` degrees,
     steeper than the sit's 54) to its fullest point `full` (heading straight down there), then on into the sit's own
     long S down the far leg, joining it at canvas y `qY` along its own tangent. The sit's chest swells 20 units under
     a chin set this low and bunches its whole turn at the bottom (a shoulder knob); this keeps the lift's long convex.
     The body's white (it runs up the chest to the chin) follows the new line; the far leg's white starts lower. */
  function chest(cat, o) {
    var i = mainLine(cat), segs = kit.segs(cat[i].d), ch = cat.at.chin, k = -1;
    for (var j = 0; j < segs.length; j++) if (near(segs[j][0], ch)) { k = j; break; }
    if (k < 0) return cat;
    var oldA = segs[k], oldB = segs[k + 1], uq = uAtY(oldB, o.qY), parts = split(oldB, uq), Q = parts[1][0];
    var tQ = unit(sub(parts[1][1], Q)), F = o.full;
    var segA = [ch, add(ch, vec(o.dep), o.hA[0]), [F[0], F[1] - o.hA[1]], F];
    var segB = [F, [F[0], F[1] + o.hB[0]], add(Q, tQ, -o.hB[1]), Q];
    segs.splice(k, 2, segA, segB, parts[1]);
    var out = cat.slice();
    out[i] = withD(cat[i], kit.d(segs));
    // the body's white: up the old chest (the far leg's line from y 152 to the old fullest point, then to the chin)
    var ws = kit.segs(cat[0].d.replace(/Z$/, ''));
    for (var m = 1; m < ws.length; m++) if (near(ws[m][3], ch) && near(ws[m - 1][3], oldA[3])) {
      // where the white leaves the far leg's line (u0 on the old line), then the old line from there up to Q
      var u0 = 0, p0 = ws[m - 1][0];
      for (var q = 0; q <= 400; q++) if (len(sub(bez(oldB, q / 400), p0)) < len(sub(bez(oldB, u0), p0))) u0 = q / 400;
      var low = split(split(oldB, u0)[0], uq / u0)[1];
      ws.splice(m - 1, 2, kit.rev([low])[0], kit.rev([segB])[0], kit.rev([segA])[0]);
      out[0] = withD(cat[0], kit.d(ws, true));
      break;
    }
    return keepAt(out, cat);
  }
  /* The hunch: the shoulders rounded up and back. The back's shoulder node (where the neck's dip turns into the
     back's long sweep) moves `d` with both its handles (so the tangent there stays one line, no kink) and its handles
     turn `rot` degrees, in the long stroke and in the body's white alike: the back stays one convex sweep, only
     fuller over the shoulders. */
  function hunch(cat, o) {
    var i = mainLine(cat), N = cat.at.nape, segs = kit.segs(cat[i].d), S = null;
    for (var j = 1; j < segs.length; j++) if (near(segs[j][3], N)) { S = segs[j][0]; break; }
    if (!S) return cat;
    var mv = function (q) { return add(kit.rot(q, S, o.rot || 0), o.d); };
    function fix(sg) {
      for (var k = 0; k < sg.length; k++) {
        if (near(sg[k][3], S)) { sg[k] = [sg[k][0], sg[k][1], mv(sg[k][2]), add(S, o.d)]; }
        if (near(sg[k][0], S)) { sg[k] = [add(S, o.d), mv(sg[k][1]), sg[k][2], sg[k][3]]; }
      }
      return sg;
    }
    var out = cat.slice();
    out[i] = withD(cat[i], kit.d(fix(segs)));
    out[0] = withD(cat[0], kit.d(fix(kit.segs(cat[0].d.replace(/Z$/, ''))), true));
    return keepAt(out, cat);
  }
  /* The drop, seated against the temple: its tip at `at` (head units), slid down `slide` canvas units, scaled `sc`
     about its tip, then moved sideways so that its outline keeps `gap` units (pen centre to pen centre) from the
     head's outline: touching at app sizes, so it reads as a sweat drop and never as a stray speck. */
  function seatDrop(cat, tilt, at, sc, slide, gap) {
    var i = mainLine(cat), F = headFrame(cat, tilt), c = cat.at.head, segs = kit.segs(cat[i].d), hp = [];
    segs.forEach(function (s) { for (var q = 0; q <= 24; q++) { var p = bez(s, q / 24); if (p[0] > c[0] + 8 && Math.abs(p[1] - c[1]) < 26) hp.push(p); } });
    var tip = add(F.toC(at), [0, slide]), dp = [];
    DROP.forEach(function (s) { for (var q = 0; q <= 16; q++) { var p = bez(s, q / 16); dp.push([p[0] * sc, p[1] * sc]); } });
    function dmin(dx) { var m = 1e9; dp.forEach(function (p) { var x = tip[0] + dx + p[0], y = tip[1] + p[1]; hp.forEach(function (h) { var d = Math.hypot(x - h[0], y - h[1]); if (d < m) m = d; }); }); return m; }
    var lo = -3, hi = 12;
    for (var it = 0; it < 30; it++) { var mid = (lo + hi) / 2; if (dmin(mid) < gap) lo = mid; else hi = mid; }
    var T = [tip[0] + hi, tip[1]];
    return kit.d(kit.mapSegs(DROP, function (p) { return [T[0] + p[0] * sc, T[1] + p[1] * sc]; }), true);
  }
  // a small drop: a sharp tip (one node), slightly concave sides swelling into a round bottom (one even arc each side)
  var DROP = kit.chain([[0, 0, 58, 0, 4.4], [4.9, 9.8, 95, 4.6, 2.64], [0, 14.6, 180, 2.64, 2.64], [-4.9, 9.8, -95, 2.64, 4.6], [0, 0, -58, 4.4, 0]]);
  /* Sitting smaller (s 0.88) and hunched (tall 0.95, the shoulders rounded up and back), the head sunk into the
     shoulders and bowed the lift's 3 degrees, so the round back of the skull and the lift's soft nape (a 1.4-unit dip)
     stay; the chest one long convex sweep from the chin, its fullest point 3.3 units in front of the cheek; the head
     part's lowered ears (turned 52 and 50 degrees out, earLen 0.65: flattened to the sides), eyes glancing down and
     away (look dx -1.2, dy 2.2), its flat mouth; paws together, the tail at rest. One sky drop (0.82, a 0.8 outline, a
     quiet boil) seated against the temple, touching the head's outline at app sizes. Motion: full on frame 1 (the
     still), it slides down 0.5, 1.4 then 3 units (easing in, like a drop gathering speed) over frames 2 to 4; frames 5
     and 6 are the next drop forming at the temple (0.45, 0.75), full again on frame 1. */
  var WORRY = { tilt: 3, ears: [52, 50], earLen: 0.65, look: [-1.2, 1.6], eyeDown: 0.6, headDx: 1, headDy: 5.5,
    neck: null,
    chest: { dep: 60, full: [133.2, 128.5], hA: [10, 11], hB: [9, 12], qY: 150 },
    hunch: { d: [-2.2, -1.5], rot: 10 },
    drop: [20.5, -9], dropS: 0.82, gap: 3, grow: [1, 1, 1, 1, 0.45, 0.75], slide: [0, 0.5, 1.4, 3.0, 0, 0] };
  I.define('worry', { w: 200, h: 200, draw: function (t, K) {
    var W = WORRY, f = Math.round(t * 6) % 6;
    var cat = K.part('sit', { y: 182, s: 0.88, tall: 0.95, headDx: W.headDx, headDy: W.headDy, tail: -2,
      head: { eyes: 'look', dx: W.look[0], dy: W.look[1], mouth: 'flat', tilt: W.tilt, ears: W.ears, earLen: W.earLen } });
    cat = nudgeEye(nudgeEye(cat, W.tilt, 0, [0, W.eyeDown]), W.tilt, 1, [-0.45, W.eyeDown]);
    cat = napePatch(steady(chest(hunch(neck(cat, W.neck), W.hunch), W.chest)), 0.88, W.tilt - 3);
    var d = seatDrop(cat, W.tilt, W.drop, W.dropS * W.grow[f], W.slide[f], W.gap);
    return keepAt(cat.concat([K.shape(d, 's', { w: 0.8, boil: 0.2 })]), cat);
  } });
})();

// ---------------------------------------------------------------- poses-b
/* Health Class cat · group B, feelings: cheer, laugh, heart (200 x 200 each), built on parts.js (the sit, the head, the
   paw). Load after engine.js and parts.js:
     node render.mjs --files engine.js,parts.js,poses-model.js,poses-b.js --poses cheer,laugh,heart --out out/poses-b.png

   All three sit on `sit` at the lift's placement (y 182): the head, face, pen, body and tail are the model's own, and
   parts.js is called, never copied or edited. The local helpers below only add what the parts do not have: a raised
   foreleg that bends softly at the elbow and widens toward the shoulder, the near hind foot (cheer), an open grin, the
   neck rejoined a little higher on the skull when the head is thrown back (so the nape keeps the lift's soft S), a
   lean back from the hips that leaves the head unslanted (laugh), and short pen ticks. */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit, rot = kit.rot, RAD = Math.PI / 180;

  // ---------------------------------------------------------------------------------------------- small geometry
  function add(p, v, k) { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function unit(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function leftOf(t) { return [t[1], -t[0]]; }
  function vec(deg, l) { return [Math.cos(deg * RAD) * (l == null ? 1 : l), Math.sin(deg * RAD) * (l == null ? 1 : l)]; }
  function bz(s, t) {
    var u = 1 - t;
    return [u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
      u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1]];
  }
  function dbz(s, t) {
    var u = 1 - t, a = sub(s[1], s[0]), b = sub(s[2], s[1]), c = sub(s[3], s[2]);
    return [3 * (u * u * a[0] + 2 * u * t * b[0] + t * t * c[0]), 3 * (u * u * a[1] + 2 * u * t * b[1] + t * t * c[1])];
  }
  function cOf(segs) { return kit.d(segs).replace(/^M[^C]*/, ''); }
  function near(a, b, e) { return Math.abs(a[0] - b[0]) < (e || 0.05) && Math.abs(a[1] - b[1]) < (e || 0.05); }
  // a chain sampled finely: [{ p, u (segment index + t), s (arc length from its start) }]
  function samples(segs, n) {
    n = n || 40; var out = [], s = 0, prev = null;
    segs.forEach(function (sg, i) {
      for (var j = (i ? 1 : 0); j <= n; j++) {
        var p = bz(sg, j / n); if (prev) s += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        out.push({ p: p, u: i + j / n, s: s }); prev = p;
      }
    });
    return out;
  }
  // where a chain first crosses a polyline (points), as a sample index into samples(segs)
  function crossing(sm, poly) {
    function isx(a, b, c, d) {
      var r = sub(b, a), q = sub(d, c), den = r[0] * q[1] - r[1] * q[0]; if (Math.abs(den) < 1e-9) return false;
      var t = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
      return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    for (var i = 0; i + 1 < sm.length; i++) for (var k = 0; k + 1 < poly.length; k++) if (isx(sm[i].p, sm[i + 1].p, poly[k], poly[k + 1])) return i;
    return -1;
  }
  function distPoly(p, poly) {
    var m = 1e9;
    for (var k = 0; k + 1 < poly.length; k++) {
      var a = poly[k], v = sub(poly[k + 1], a), L = v[0] * v[0] + v[1] * v[1], t = L ? ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L : 0;
      t = Math.max(0, Math.min(1, t)); m = Math.min(m, Math.hypot(p[0] - a[0] - v[0] * t, p[1] - a[1] - v[1] * t));
    }
    return m;
  }
  // the sit's long pen stroke (tail, back, head, chest, far leg) is the longest line of its list
  function mainLine(list) {
    var best = -1, n = 0;
    list.forEach(function (s, i) { if (s.t === 'line' && s.d.length > n) { n = s.d.length; best = i; } });
    return best;
  }
  function withD(st, d) { var c = {}; for (var k in st) c[k] = st[k]; c.d = d; return c; }
  function keepAt(out, list) { out.at = list.at; return out; }

  // ---------------------------------------------------------------------------------------------- pen ticks
  // a short spark or laugh tick: from r0 to r0 + len along `ang` (degrees) out of (cx, cy), bowed by `bend` (+ to the
  // left of its direction), so it reads as a hand's flick and not a ruler's slash
  function tick(cx, cy, ang, r0, len, bend) {
    var a = ang * RAD, ux = Math.cos(a), uy = Math.sin(a), b = bend || 0;
    var p0 = [cx + ux * r0, cy + uy * r0], p1 = [cx + ux * (r0 + len), cy + uy * (r0 + len)];
    var c1 = [p0[0] + ux * len * 0.33 + uy * b, p0[1] + uy * len * 0.33 - ux * b];
    var c2 = [p0[0] + ux * len * 0.67 + uy * b, p0[1] + uy * len * 0.67 - ux * b];
    return 'M' + kit.P(p0) + 'C' + kit.P(c1) + ' ' + kit.P(c2) + ' ' + kit.P(p1);
  }
  function ticks(K, list) { return list.map(function (d) { return K.line(d, { boil: 0.6 }); }); }

  // ---------------------------------------------------------------------------------------------- the foreleg
  /* A raised front leg as a forearm, not a pipe: its centre is a few pen-tool nodes from the shoulder (inside the body)
     to the paw (the centre of its round U), so the elbow bends softly; the two lines are the centre's true offsets
     (band), widened toward the shoulder (wr at the root, w at the paw) and running into the paw's round U along their
     own tangent (no corner where a line meets the U). Open at the root, no toe ticks unless asked.
       nodes  [x, y, heading, hIn, hOut] from the root to the paw     o.w  width at the paw (11)   o.wr  at the root
       o.back  a polyline (the body's silhouette line the arm crosses on its way out): each of the two lines then
               starts o.depth units inside it (its distance to that line), so both open ends sit at the same depth in
               the body (not staggered across the chest)
       o.toes 0 | 2 (default 0)       o.fill false: no white */
  // the two lines of a band along pen-tool nodes, offset by d (w/2 at the paw, growing to wr/2 at the root): each node
  // moves out along its own normal and each segment's handles scale by (1 + d k), k its mean curvature (+ for a right
  // turn), so a round elbow stays round on both sides: the inner line of a radius-12 bend is a radius-6.5 bend, never
  // a pinch (one cubic per centre segment, no split, nothing for the boil to crumple)
  function band(nodes, w, wr) {
    var n = nodes.length, segs = kit.chain(nodes);
    function dAt(i) { return w / 2 + (wr - w) / 2 * Math.pow(1 - i / (n - 1), 1.4); }
    function edge(side) {
      return segs.map(function (sg, i) {
        var A = nodes[i], B = nodes[i + 1], ha = A[5] == null ? A[2] : A[5], hb = B[2];
        var turn = ((hb - ha) % 360 + 540) % 360 - 180, th = Math.abs(turn) * RAD, chord = Math.hypot(B[0] - A[0], B[1] - A[1]);
        var arc = th > 1e-3 ? chord * (th / 2) / Math.sin(th / 2) : chord, k = turn * RAD / arc;
        var dA = dAt(i) * side, dB = dAt(i + 1) * side, fac = 1 + (dA + dB) / 2 * k;
        var p0 = add([A[0], A[1]], leftOf(vec(ha)), dA), p3 = add([B[0], B[1]], leftOf(vec(hb)), dB);
        return [p0, add(p0, vec(ha), A[4] * fac), add(p3, vec(hb), -B[3] * fac), p3];
      });
    }
    var L = nodes[n - 1], e = [L[0], L[1]], t = vec(L[2]), nr = leftOf(t), hw = w / 2, kk = 0.5523 * hw;
    var ae = add(e, nr, hw), be = add(e, nr, -hw), tip = add(e, t, hw);
    return { a: edge(1), b: edge(-1), cap: [[ae, add(ae, t, kk), add(tip, nr, kk), tip], [tip, add(tip, nr, -kk), add(be, t, kk), be]], center: segs };
  }
  function foreleg(K, nodes, o) {
    o = o || {};
    var w = o.w || 11, wr = o.wr || w, tb = band(nodes, w, wr), C = tb.center, n = C.length;
    var a = tb.a, b = tb.b, list = [];
    if (o.back) {
      // from where the line crosses the back, walk in toward the root until it lies o.depth units inside (its distance
      // to the back line): both ends then sit on one line parallel to the back, at the same depth in the body
      var cutAt = function (edge) {
        var sm = samples(edge, 80), i = crossing(sm, o.back), D = o.depth || 7;
        if (i < 0) return edge;
        for (var j = i; j >= 0; j--) if (distPoly(sm[j].p, o.back) >= D) return kit.cut(edge, sm[j].u, edge.length);
        return edge;
      };
      a = cutAt(a); b = cutAt(b);
    }
    if (o.fill !== false) list.push(kit.fill(kit.d(a) + cOf(tb.cap) + cOf(kit.rev(b)) + 'Z'));
    list.push(K.line(kit.d(a) + cOf(tb.cap) + cOf(kit.rev(b))));
    // toe hooks: in the paw's frame (tip at 0,0, the leg running up -y), turned to the forearm's end
    var L = C[n - 1], tip = L[3], t = unit(dbz(L, 1)), lx = leftOf(t), h = w / 2;
    function toC(p) { return [tip[0] + lx[0] * p[0] + t[0] * p[1], tip[1] + lx[1] * p[0] + t[1] * p[1]]; }
    if (o.toes) [-0.32, 0.32].forEach(function (f) {
      var x = f * h, y0 = -(h - Math.sqrt(h * h - x * x)) * 0.92 - 1.1, k = h * 0.5;
      var pts = [[x, y0], [x + 0.05, y0 - k * 0.45], [x - 0.12, y0 - k * 0.8], [x - 0.62, y0 - k]].map(toC);
      list.push(K.line('M' + kit.P(pts[0]) + 'C' + kit.P(pts[1]) + ' ' + kit.P(pts[2]) + ' ' + kit.P(pts[3]), { w: 0.8, boil: 0.45 }));
    });
    list.tip = tip;
    return list;
  }

  // ---------------------------------------------------------------------------------------------- the open grin
  /* An open happy mouth for cheer and laugh: no stem, no ㅅ. One wide, shallow D at the face's weight (0.8): a nearly
     flat top edge, its corners a hair up, wider than the nose, set clear under it (a paper gap), and a round bottom.
     White inside, or a flat soft fill (o.fill). Head-local units (the nose is 2.8 wide, its bottom at y 6.45), placed
     with the head's own transform (sit's at.head, at.headS and the tilt), so it sits where the model's mouth sits; the
     head is drawn with mouth: 'none' (the nose alone). */
  var GRIN = { top: 8.0, hw: 2.8, up: 0.6, sag: 0.15, deep: 3.0 };
  function grin(K, at, tilt, fill) {
    var G = GRIN, P = kit.P, x0 = 12.5, L = [x0 - G.hw, G.top - G.up], R = [x0 + G.hw, G.top - G.up], yb = G.top + G.deep;
    var d = 'M' + P(L) + 'C' + P([x0 - G.hw * 0.45, G.top + G.sag]) + ' ' + P([x0 + G.hw * 0.45, G.top + G.sag]) + ' ' + P(R) +
      'C' + P([R[0] + 0.05, R[1] + G.deep * 0.62]) + ' ' + P([x0 + G.hw * 0.55, yb]) + ' ' + P([x0, yb]) +
      'C' + P([x0 - G.hw * 0.55, yb]) + ' ' + P([L[0] - 0.05, L[1] + G.deep * 0.62]) + ' ' + P(L) + 'Z';
    var list = [K.shape(d, fill || 'w', { w: 0.8, boil: 0.2 })];
    return K.place(list, { sx: at.headS, sy: at.headS, r: tilt, x: at.head[0], y: at.head[1] });
  }

  // ---------------------------------------------------------------------------------------------- the neck
  /* With the head thrown back (tilt < 0) the model's nape turns in under the skull and the neck dips deeper than the
     model's 1.8 units (a swan neck). Here the back line leaves the skull a little higher, at `u` along the round back of
     the skull (0 = the nape), along the skull's own tangent with the lift's long handle `h` (17): the soft S of the lift
     again, nearly straight into the skull. `hs` is the shoulder's handle (the lift's 16). The nape's corner it skips lies
     inside the body's white. The body's white starts at the same point. */
  function rejoinNeck(list, u, h, hs) {
    var i = mainLine(list), segs = kit.segs(list[i].d), nape = list.at.nape, k = -1;
    for (var j = 0; j < segs.length; j++) if (near(segs[j][3], nape)) { k = j; break; }
    if (k < 0) return list;
    var skull = segs[k + 1], J = bz(skull, u), tJ = unit(dbz(skull, u)), up = kit.cut([skull], u, 1)[0];
    var sh = segs[k][0], c1 = add(sh, unit(sub(segs[k][1], sh)), hs || Math.hypot(segs[k][1][0] - sh[0], segs[k][1][1] - sh[1]));
    var neck = [sh, c1, add(J, tJ, -h), J];
    segs.splice(k, 2, neck, up);
    var out = list.slice();
    out[i] = withD(list[i], kit.d(segs));
    // the body's white (the first stroke): its first segment is the neck, nape to shoulder
    var ws = kit.segs(list[0].d.replace(/Z$/, ''));
    if (near(ws[0][0], nape) && near(ws[0][3], sh)) { ws[0] = [J, add(J, tJ, -h), c1, sh]; out[0] = withD(list[0], kit.d(ws, true)); }
    out = keepAt(out, list);
    out.neck = neck; out.backSeg = segs[k - 1];
    return out;
  }

  // the standing far front leg's inner line (the last segment of the sit's long stroke) made to end at canvas y `y`:
  // under a forearm (its white, drawn after it, hides the end), so it reads as passing behind the arm
  function innerTo(list, y) {
    var i = mainLine(list), segs = kit.segs(list[i].d), L = segs[segs.length - 1], a = L[0];
    segs[segs.length - 1] = [a, [a[0], a[1] - (a[1] - y) * 0.36], [a[0] + 0.35, a[1] - (a[1] - y) * 0.7], [a[0] + 0.7, y]];
    var out = list.slice(); out[i] = withD(list[i], kit.d(segs));
    return keepAt(out, list);
  }

  // ---------------------------------------------------------------------------------------------- the hind foot
  /* Both front legs raised (cheer): the sit is drawn with far: false, so its chest line stops under the chest. The near
     hind foot then shows, lying forward on the ground, toes to the right, coming out from BEHIND the thigh: its sole and
     its top line both start ON the thigh's front edge (the model's haunch crease, redrawn here a little longer so it
     reaches down toward the ground), as covered T's: the foot is drawn first, then a strip of the thigh's own white
     (left of the crease, inside the body) hides both 0.4-unit overshoots, then the crease line itself. The foot is as
     wide as the front paws (11) and narrows a little toward the ankle; the toe is an even half circle (two quarter arcs
     meeting at one round tip node, handles 3). The foot tips down toward the toe (th), so its sole leaves the tail's
     line in a wide wedge of paper and only the round toe comes near it (2.6 units, like the lift's near paw); the tail's
     top line starts under the toe, so nothing runs under the sole. The chest runs on (the same pen stroke) as the belly,
     down onto the top of the foot a little behind the toe, at a clear angle: a T, its end under the foot's white, drawn
     after it. The body's white is rebuilt along the belly, so no white lies past a line. */
  var HF = { th: 19, h: 5.5, S: [110.5, 179.8], taper: 7, crease: [[75.5, 119, 27, 0, 13], [94.8, 146.5, 77, 9.5, 11], [92.6, 177.4, 108, 11, 0]] };
  function hindFoot(K, list, tall) {
    function fy(p) { return [p[0], 182 + (p[1] - 182) * tall]; }
    var th = HF.th, h = HF.h, a = vec(th), nrm = leftOf(a), S = fy(HF.S), Tp = add(S, nrm, 2 * h);
    var crease = kit.mapSegs(kit.chain(HF.crease), fy), cpoly = samples(crease, 40).map(function (x) { return x.p; });
    // where a straight ray from p heading `deg` meets the crease (its last crossing going left)
    function onCrease(p, deg) {
      var v = vec(deg), best = null;
      for (var k = 0; k + 1 < cpoly.length; k++) {
        var c = cpoly[k], q = sub(cpoly[k + 1], c), den = v[0] * q[1] - v[1] * q[0]; if (Math.abs(den) < 1e-9) continue;
        var t = ((c[0] - p[0]) * q[1] - (c[1] - p[1]) * q[0]) / den, u = ((c[0] - p[0]) * v[1] - (c[1] - p[1]) * v[0]) / den;
        if (t > 0 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t: t, p: add(p, v, t) };
      }
      return best.p;
    }
    var solDeg = th + 180, topDeg = th + 180 - HF.taper;
    var P0 = add(onCrease(S, solDeg + 1.5), vec(solDeg + 1.5), 0.4), P1 = add(onCrease(Tp, topDeg - 2), vec(topDeg - 2), 0.4);
    var Ls = Math.hypot(S[0] - P0[0], S[1] - P0[1]), Lt = Math.hypot(Tp[0] - P1[0], Tp[1] - P1[1]), kU = 0.5523 * h, Tip = add(add(S, nrm, h), a, h);
    // sole (a hair convex), the toe (two quarter arcs meeting at ONE round tip node: an even half circle, handles 3),
    // the top of the foot back to the crease
    var fs = kit.chain([[P0[0], P0[1], th + 3, 0, Ls * 0.36], [S[0], S[1], th, Ls * 0.36, kU, th], [Tip[0], Tip[1], th - 90, kU, kU], [Tp[0], Tp[1], th + 180, kU, Lt * 0.36],
      [P1[0], P1[1], topDeg + 2, Lt * 0.36, 0]]);
    var top = fs[3];
    var foot = [kit.fill(kit.d(fs) + 'Z'), K.line(kit.d(fs))];
    // the strip of the thigh's white over the two T's (its straight edges lie in the body's white), then the crease
    // (its edge on the crease is the crease's own cubic, cut: it trembles with few points, as smoothly as the line)
    var cs = samples(crease, 40), y0 = P1[1] - 5, u0 = 0;
    cs.forEach(function (x) { if (x.p[1] < y0) u0 = x.u; });
    var edge = kit.cut(crease, u0, crease.length), e0p = edge[0][0], e1p = edge[edge.length - 1][3];
    var strip = kit.d(edge) + 'L' + kit.P(add(e1p, [-4, 0])) + 'L' + kit.P(add(e0p, [-5, 0])) + 'Z';
    var thigh = [kit.fill(strip), K.line(kit.d(crease))];
    // the belly: from the chest's end, one convex arc down onto the top of the foot a little behind the toe (0.4 into it)
    var i = mainLine(list), segs = kit.segs(list[i].d), last = segs[segs.length - 1], E = last[3], e0 = unit(dbz(last, 1));
    var B = bz(top, HF.belly), nB = leftOf(unit(dbz(top, HF.belly))), end = add(B, nB, -0.4);   // -nB: into the foot
    var h0 = Math.atan2(e0[1], e0[0]) / RAD, ch = Math.atan2(end[1] - E[1], end[0] - E[0]) / RAD, tB = dbz(top, HF.belly);
    // its end comes down onto the foot at a clear angle (about 35 degrees to the foot's top line), never along it
    var he = Math.min(2 * ch - h0, Math.atan2(tB[1], tB[0]) / RAD + (Math.atan2(tB[1], tB[0]) < 0 ? 360 : 0) - 35), bl = Math.hypot(end[0] - E[0], end[1] - E[1]);
    var belly = kit.chain([[E[0], E[1], h0, 0, bl * 0.45], [end[0], end[1], he, bl * 0.5, 0]]);
    // the tail's top line starts under the toe, not under the heel: cut the long stroke's first segment there
    var s0 = segs[0], tx = HF.tailX, u0 = 0;
    for (var q = 0; q <= 1; q += 0.005) if (bz(s0, q)[0] <= tx) u0 = q;
    segs[0] = kit.cut([s0], u0, 1)[0];
    var out = [];
    list.forEach(function (st, j) {
      if (st.t === 'line' && /^M75\.5 /.test(st.d)) return;           // the sit's haunch crease: redrawn after the foot
      out.push(j === i ? withD(st, kit.d(segs.concat(belly))) : st);
    });
    // the body's white: back (as the sit built it), the straight run inside the tail's band and along its top line to
    // under the toe, up into the foot, up the belly and the chest (the main stroke's own last segments) to the chin
    var Cu = add(S, nrm, h), ws = kit.segs(list[0].d.replace(/Z$/, '')), path = kit.d(ws.slice(0, 3)), low = add(Cu, nrm, -(h - 0.3));
    ws.slice(3).forEach(function (s) { var p = s[3]; if (p[0] < low[0] - 0.3 && p[1] > 175) path += 'L' + kit.P(p); });
    path += 'L' + kit.P([low[0], fy([0, 182.1])[1]]) + 'L' + kit.P(low) + 'L' + kit.P(Cu) + 'L' + kit.P(end);
    path += cOf(kit.rev(belly)) + cOf(kit.rev(segs.slice(segs.length - 2))) + 'L' + kit.P([112, 72]) + 'Z';
    out[0] = withD(list[0], path);
    return { list: keepAt(out, list), foot: foot, thigh: thigh };
  }
  HF.tailX = 111.5; HF.belly = 0.3;

  // ---------------------------------------------------------------------------------------------- cheer
  /* Both front paws up high in a V, a little hop. The body is 3/4 right, so its near side is the cat's right: the near
     foreleg rises from inside the near shoulder up-left, in front of the neck (it crosses the back line well below the
     nape, so the nape's soft S shows above it), its paw beside the head; the far foreleg rises from behind the chest
     (drawn first: the body's white hides its root and the chest line runs over it) up-right past the cheek. Each
     forearm bends softly (a bow), widens from 11 at the paw to 12.5 at the shoulder; the near arm's two lines stop at
     the same depth inside the back. Clean round paws, no toe ticks. Happy closed eyes (^ ^), the open grin, the face
     turned up 5 degrees. Both front legs are up, so the sit is drawn with far: false and the near hind foot shows under
     the belly (hindFoot). Three spark ticks in clear paper, well off the paws: two out of the far paw, one out of the
     near paw. Motion: one soft hop, up = 2 (1 - cos 2 pi t): 0, 1, 3, 4, 3, 1, a light squash on the contact frame
     (tall 0.99) and a stretch rising and falling (1.004); the arms open 3 degrees at the top and the sparks flick out a
     little longer. */
  var TALL = [0.99, 1.004, 1, 1, 1, 1.004];
  var CHEER = { u: 0.15, h: 18, hs: 16, far: [[128, 109.5, -38, 0, 19], [154, 53, -80, 21, 0]],
    near: [[105, 112, -163, 0, 21], [61, 54, -100, 24, 0]], depth: 8, r0: 13.5, len: 6.5 };
  I.define('cheer', { w: 200, h: 200, draw: function (t, K) {
    var f = Math.round(t * 6) % 6, hop = 2 * (1 - Math.cos(t * K.TAU)), up = hop / 4, swing = 3 * up, tilt = -5;
    var cat = K.part('sit', { y: 182, near: false, far: false, tall: TALL[f], head: { eyes: 'happy', mouth: 'none', tilt: tilt } });
    cat = rejoinNeck(cat, CHEER.u, CHEER.h, CHEER.hs);
    var neck = cat.neck;
    var hf = hindFoot(K, cat, TALL[f]);
    var dy = cat.at.shoulder[1] - 110;
    function arm(nodes, sw) {
      var root = [nodes[0][0], nodes[0][1] + dy];
      return nodes.map(function (n, k) { var p = k ? rot([n[0], n[1] + dy], root, sw) : root, q = n.slice(); q[0] = p[0]; q[1] = p[1]; if (k) q[2] += sw; return q; });
    }
    var fn = arm(CHEER.far, swing), nn = arm(CHEER.near, -swing);
    var back = samples([cat.backSeg, neck], 30).map(function (x) { return x.p; });
    var far = foreleg(K, fn, { w: 11, wr: 12.5 });
    var nearA = foreleg(K, nn, { w: 11, wr: 12.5, back: back, depth: CHEER.depth });
    var fTip = far.tip, nTip = nearA.tip;
    var fa = fn[1][2], na = nn[1][2], k = 0.92 + 0.16 * up, r0 = CHEER.r0, L = CHEER.len * k;
    var sparks = ticks(K, [tick(fTip[0], fTip[1], fa - 30, r0, L, 0.8), tick(fTip[0], fTip[1], fa + 26, r0, L, 0.8),
      tick(nTip[0], nTip[1], na - 6, r0, L, -0.8)]);
    var all = far.concat(hf.list, grin(K, cat.at, tilt, CHEER.mouth), hf.foot, hf.thigh, nearA, sparks);
    return K.place(all, { y: -hop });
  } });

  // ---------------------------------------------------------------------------------------------- laugh
  /* Sitting, leaning back from the hips, laughing. The body leans back about 10 degrees (lean 0.18): the haunch, the
     tail and the far paw stay within 0.7 unit of the lift's, the lean grows up the belly and the chest, and it eases out
     up the neck, so the head rides back whole (never slanted: the ears stand like the lift's, the skull keeps its round
     back), 11 to 14 units behind the lift's head. The head is thrown back by its own tilt (-12), chin up, and the neck rejoins the skull a
     little higher with the lift's long handle (rejoinNeck), so the nape is the lift's soft S. Eyes shut (^ ^), the open
     grin with a soft rose inside. The near paw holds the belly: from the shoulder the upper arm runs down the chest, the
     elbow bends out in an even turn, and the forearm lies across the lower belly to the paw (a clean round end, no
     ticks); the far front leg stands, its inner line running up under the forearm (innerTo). Two short laugh ticks by
     the face.
     Motion: ha-ha: the shoulders bounce, back-and-up then forward-and-down on alternate frames (the whole head, easing
     to nothing at the hips), and the two ticks take turns, one per frame, riding with the head. */
  var LAUGH = { tilt: -12, lean: 0.18, dx: -1, x: 0.7, y0: 74, y1: 112, yb0: 150, yb1: 176, u: 0.3, h: 18, hs: 17,
    root: [-4, 1, 126, 0, 10], elbow: [106, 137.5, 64, 10, 10], paw: [130, 146, -12, 10, 0],
    ang: [-32, -2], r0: 14.5, len: 6.5, inner: 147, shake: [1.6, -0.9], mouth: 'rs' };
  // the lean: x moves by lean * leanH(y), leanH the height the lean sees: 0 at the hips, growing up the body, constant
  // above the neck (the head moves whole). Its rate w(y) ramps up smoothly from the hips (yb1 -> yb0) and down again
  // up the neck (y1 -> y0); leanH is its integral from y down, tabulated
  function makeLean(y0, y1, yb0, yb1) {
    var N = 800, step = 200 / N, tab = new Array(N + 1);
    function w(s) { return kit.sstep(y0, y1, s) * (1 - kit.sstep(yb0, yb1, s)); }
    tab[N] = 0;
    for (var i = N - 1; i >= 0; i--) { var s0 = i * step; tab[i] = tab[i + 1] + (w(s0) + 4 * w(s0 + step / 2) + w(s0 + step)) * step / 6; }
    return function (y) { var f = y / step; if (f <= 0) return tab[0]; if (f >= N) return 0; var j = Math.floor(f), r = f - j; return tab[j] * (1 - r) + tab[j + 1] * r; };
  }
  var leanH = makeLean(LAUGH.y0, LAUGH.y1, LAUGH.yb0, LAUGH.yb1);
  function headPt(at, tilt, p) { var q = rot([p[0] * at.headS, p[1] * at.headS], [0, 0], tilt); return [at.head[0] + q[0], at.head[1] + q[1]]; }
  I.define('laugh', { w: 200, h: 200, draw: function (t, K) {
    var f = Math.round(t * 6) % 6, sg = f % 2 ? -1 : 1, tilt = LAUGH.tilt, lean = LAUGH.lean, Hh = leanH(0);
    var sx = LAUGH.shake[0] * sg, sy = LAUGH.shake[1] * sg;
    var cat = K.part('sit', { y: 182, near: false, headDx: LAUGH.dx, head: { eyes: 'happy', mouth: 'none', tilt: tilt } });
    cat = rejoinNeck(cat, LAUGH.u, LAUGH.h, LAUGH.hs);
    cat = innerTo(cat, LAUGH.inner);
    var sh = cat.at.shoulder, r = LAUGH.root;
    var arm = foreleg(K, [[sh[0] + r[0], sh[1] + r[1], r[2], r[3], r[4]], LAUGH.elbow, LAUGH.paw], { w: 11, wr: 12.5 });
    function leanP(p) { var hh = leanH(p[1]), k = hh / Hh; return [p[0] + LAUGH.x - lean * hh - sx * k, p[1] + sy * k]; }
    var body = kit.move(cat.concat(grin(K, cat.at, tilt, LAUGH.mouth), arm), leanP);
    // the laugh ticks: by the face, out from the mouth to the right, riding with the head; one per frame, in turn
    var m = leanP(headPt(cat.at, tilt, [12.5, 8])), a = LAUGH.ang[f % 2];
    return body.concat(ticks(K, [tick(m[0], m[1], a, LAUGH.r0, LAUGH.len, 0.8)]));
  } });

  // ---------------------------------------------------------------------------------------------- heart
  /* Sitting, hugging a rose heart to the chest, eyes closed, a small smile, the head bowed 3 degrees (the lift's):
     content. The heart (rose, outlined in the pen) is small and hand-drawn: a shallow cleft, lobes a little flat and not
     quite alike, held inside the chest's silhouette under the chin. The near foreleg hugs it: the upper arm comes down
     clear of the heart's left lobe (both lobes and the cleft show), the elbow turns under it, and the forearm lies
     diagonally across the heart's lower right edge, in front of it (the edge and the point are under the arm's white;
     the heart's lines meet the arm at clear angles), round an elbow that is one even arc (radius 12, the inner line 6),
     to the paw on the heart's right flank, its round end past the heart's edge and 3 or more units inside the chest
     line. The far front leg stands; its inner line runs up under the forearm and ends there. Motion: the heart
     beats about its own centre, a lub-dub from 0.95 to 1.05, and the paw rides on its right flank, so the hug pulses. */
  var HEART = 'M0.3 -6.6C-1.6 -10.3 -4.9 -12 -8.2 -11.5C-11.8 -10.9 -14.1 -8 -13.9 -4.3C-13.6 1.2 -7.4 6.6 0.2 12.4' +
    'C7.6 6.9 13.5 1.6 14 -3.9C14.3 -7.8 12 -10.8 8.6 -11.4C5.2 -12 2 -10.2 0.3 -6.6Z';
  var BEAT = [1.05, 0.97, 1.035, 0.96, 0.95, 0.955];
  var HEARTP = { x: 119.5, y: 114.5, s: 0.86, r: 2, flank: [12.6, 1.5] };
  var HEART_ARM = { root: [97.2, 96, 90, 0, 8], mid: [98.2, 116.9, 90, 8, 6.7], elbow: [110.3, 129, 0, 6.7, 8], paw: [-0.9, 0.2, -42, 8, 0] };
  I.define('heart', { w: 200, h: 200, draw: function (t, K) {
    var beat = BEAT[Math.round(t * 6) % 6], H = HEARTP, sc = H.s * beat;
    var cat = K.part('sit', { y: 182, near: false, head: { eyes: 'closed', mouth: 'smile', tilt: 3 } });
    var out = innerTo(cat, 130);                                      // the far leg's inner line, up under the forearm
    var heart = K.shape(K.xf(HEART, { s: sc, r: H.r, x: H.x, y: H.y }), 'r');
    // the paw rides on the heart's right flank (a point of the heart, beat with it)
    var fl = rot([H.flank[0] * sc, H.flank[1] * sc], [0, 0], H.r), pw = HEART_ARM.paw;
    var paw = [H.x + fl[0] + pw[0], H.y + fl[1] + pw[1], pw[2], pw[3], pw[4]];
    var arm = foreleg(K, [HEART_ARM.root, HEART_ARM.mid, HEART_ARM.elbow, paw], { w: 10.5, wr: 12 });
    return out.concat([heart], arm);
  } });
})();

// ---------------------------------------------------------------- poses-c
/* Health Class cat · group C, rest: sleep (200 x 160) and hammock (240 x 170), built on parts.js. Load after engine.js
   and parts.js:
     node render.mjs --files engine.js,parts.js,poses-model.js,poses-c.js --poses sleep,hammock --out out/poses-c.png
   Both lie on bodies of their own (MODEL.md 2, "on your own body"). */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit, chain = kit.chain, D = kit.d, cut = kit.cut, rev = kit.rev, rot = kit.rot, sstep = kit.sstep, P = kit.P;
  var RAD = Math.PI / 180;

  function cOf(segs) { return D(segs).replace(/^M[^C]*/, ''); }
  function bz(s, t) {
    var u = 1 - t;
    return [u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
      u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1]];
  }
  function at(segs, u) { var i = Math.min(segs.length - 1, Math.floor(u)); return bz(segs[i], u - i); }
  // a point given in the head's local units (the box centre at 0, 0) -> canvas
  function hp(o, p) {
    var s = o.s || 1, a = (o.tilt || 0) * RAD, x = p[0] * s, y = p[1] * s;
    return [o.x + x * Math.cos(a) - y * Math.sin(a), o.y + x * Math.sin(a) + y * Math.cos(a)];
  }
  // the u a given arc length further along a chain (dl may be negative)
  function walk(A, u, dl) {
    var n = 80, sgn = dl < 0 ? -1 : 1, left = Math.abs(dl), p = at(A, u);
    while (left > 0) {
      var u2 = Math.max(0, Math.min(A.length, u + sgn * A.length / (n * 10))), q = at(A, u2), d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d >= left || u2 === u) return u + (u2 - u) * (d ? left / d : 0);
      left -= d; u = u2; p = q;
    }
    return u;
  }
  // pen-tool nodes along a run of even arcs: from p heading h (degrees), each [length, turn°] an arc of constant bend
  // (handles 4/3 tan(turn / 4) r), so the curvature only steps where the bend is meant to tighten
  function arcs(p, h, list) {
    var nodes = [[p[0], p[1], h, 0, 0]], x = p[0], y = p[1];
    list.forEach(function (a) {
      var L = a[0], tr = a[1] * RAD, r = Math.abs(tr) > 1e-6 ? L / Math.abs(tr) : 0;
      var k = Math.abs(tr) > 1e-6 ? 4 / 3 * Math.tan(Math.abs(tr) / 4) * r : L / 3;
      var mid = h * RAD + tr / 2, ch = Math.abs(tr) > 1e-6 ? 2 * r * Math.sin(Math.abs(tr) / 2) : L;
      x += Math.cos(mid) * ch; y += Math.sin(mid) * ch;
      nodes[nodes.length - 1][4] = k; h += a[1];
      nodes.push([x, y, h, k, 0]);
    });
    return nodes;
  }
  // even-arc handle for a segment from heading h0 to h1 with chord c (degrees)
  function hArc(c, h0, h1) { var th = Math.abs(h1 - h0) * RAD; if (th < 1e-4) return c / 3; var r = c / (2 * Math.sin(th / 2)); return 4 / 3 * Math.tan(th / 4) * r; }
  // a small pen "z", soft like the line (each bar a hair bowed), `sz` wide, centred on c
  function zee(c, sz) {
    var h = sz / 2, v = sz * 0.44, b = sz * 0.05;
    function p(x, y) { return P([c[0] + x, c[1] + y]); }
    return 'M' + p(-h, -v + b * 0.4) + 'C' + p(-h * 0.4, -v - b) + ' ' + p(h * 0.4, -v - b * 0.4) + ' ' + p(h * 0.92, -v) +
      'C' + p(h * 0.3, -v * 0.3 + b) + ' ' + p(-h * 0.3, v * 0.3 + b) + ' ' + p(-h * 0.92, v) +
      'C' + p(-h * 0.4, v + b * 0.4) + ' ' + p(h * 0.4, v + b) + ' ' + p(h, v - b * 0.4);
  }

  // ---------------------------------------------------------------------------------------------- sleep
  /* A round curl facing right (the sit's scale: head s 1.18, paw 11.5 wide, tail 10). The dome is one even round from
     the rump over the top and gently down into the head, which lies a little lower than the dome's peak with its chin on
     a front paw. The tail wraps round the front: it comes out from under the thigh, lies along the ground in front of
     the body (its top edge drawn, its underside the lowest line) and turns up a little just past the paw's U. The paw
     rests just above the tail (clear paper under its U, as the sit's paws stand behind the tail). Strokes, back to front:
       the body's white and the tail's white;
       THIGH  the haunch's round, an even C in the rear third, both ends free, its foot just behind where the tail's top
              edge starts (the lift's haunch and tail);
       BACK   the tail's top edge (an open end under the thigh), along the front, up round the tip, back along its
              underside on the ground, round the rump, over the dome and down to the near ear's stub (a T mid-stub, off
              the stub's node, as in the stretch);
       the head (its white hides the back's T);
       the paw's white (in front of the jaw), then the paw: its top line from the throat under the face, round the U,
       its underside back into the body, the two lines parallel, both ends open.
     Motion: the dome breathes 2% about the ground (about 1.3 units at its peak), fading out before the head; three z's
     rise a third of a loop apart, growing as they rise (5 to 9 units), the newest faint on its first frame and the top
     one fading on its last, so three are always there and none pops in or out. */
  var SL = {
    G: 152,
    head: { x: 128, y: 113.5, s: 1.18, tilt: 5, earLen: 0.96 },
    // the near ear's stub: where the back meets it (t along the stub's cubic, away from its node at the ear's base)
    stubT: 0.4,
    // the tail's centre line: from under the rump, level along the ground in front of the body, then up in two even arcs
    tail: { at: [59, 147], h: 0, arcs: [[90, 0], [15, -32], [14, -22]] }, tailW: 10, tailTop: { at: [75, 137.5], h: 24, join: 99, k: 8 },
    // the back: the rump off the ground (a round quarter), one round over the dome (its peak), down into the stub
    back: { foot: [59, 152], rump: [35, 126], peakY: 88.5, hT: 38 },
    // the thigh's round: an even C in the rear third
    thigh: { at: [52, 106], h: 34, arcs: [[34, 66]] },
    // the front paw on the tail: its U's lowest point 2.6 above the tail's top edge
    paw: { w: 11.5, dir: 12, lift: 2.6, tipPast: 5, under: 11 },
    // the z's: a third of a loop apart, along a soft rise up and right of the head
    z0: [158, 86], z1: [177, 59], zSize: [5, 9]
  };
  // a point on the head's near-ear stub (local units), t along its cubic
  function stubPt(t) {
    var s = [[-21.1, -8.3], [-20.6, -10.6], [-19.6, -13.6], [-18.6, -15.6]];
    return bz(s, t);
  }
  I.define('sleep', { w: 200, h: 160, draw: function (t, K) {
    var ho = {}; for (var k in SL.head) ho[k] = SL.head[k];
    var G = SL.G, B0 = SL.back, pw = SL.paw;
    // the back's T: on the stub, the back arriving at heading hT and running 0.4 past it into the head's white
    var Ton = hp(ho, stubPt(SL.stubT)), hT = B0.hT, Tend = [Ton[0] + Math.cos(hT * RAD) * 0.4, Ton[1] + Math.sin(hT * RAD) * 0.4];
    // the back as pen-tool nodes: ground foot -> rump (leftmost, a round quarter off the ground) -> ONE half ellipse
    // over the dome (its top at peakY, through the stub's T), split in two equal parametric halves so no node sits at
    // the flattest point and every handle is 14 or longer
    var F = B0.foot, R = B0.rump, bE = R[1] - B0.peakY, uT = R[1] - Tend[1];
    var aE = (Tend[0] - R[0]) / (1 + Math.sqrt(1 - (uT / bE) * (uT / bE))), cxE = R[0] + aE;
    // (each half spans (pi - phT) / 2 of the ellipse's parameter: handles 4/3 tan(span / 4) times the tangent's length)
    var phT = Math.atan2(uT / bE, (Tend[0] - cxE) / aE), phQ = (Math.PI + phT) / 2, kE = 4 / 3 * Math.tan((Math.PI - phT) / 8);
    function eP(ph) { return [cxE + aE * Math.cos(ph), R[1] - bE * Math.sin(ph)]; }
    function eN(ph, kin, kout) { var p = eP(ph), v = [aE * Math.sin(ph), bE * Math.cos(ph)], l = Math.hypot(v[0], v[1]); return [p[0], p[1], Math.atan2(v[1], v[0]) / RAD, kin ? kE * l : 0, kout ? kE * l : 0]; }
    var kF = 0.5523 * (F[0] - R[0]), kR1 = 0.5523 * (F[1] - R[1]);
    var nR = eN(Math.PI, 1, 1), nQ = eN(phQ, 1, 1), nT = eN(phT, 1, 0);
    nR[3] = kR1; nT[0] = Tend[0]; nT[1] = Tend[1];
    var back = chain([[F[0], F[1], 180, 0, kF], nR, nQ, nT]);
    hT = nT[2];
    var tb = kit.tube(chain(arcs(SL.tail.at, SL.tail.h, SL.tail.arcs)), SL.tailW);
    // the breath: the dome rises and settles about the ground, fading out toward the head, which rests still
    var br = -0.02 * Math.cos(t * K.TAU);
    function breathe(p) { var w = 1 - sstep(78, Ton[0] - 4, p[0]); return [p[0], G - (G - p[1]) * (1 + br * w)]; }
    function Bw(d) { return kit.warp(d, breathe); }

    // the paw: its U's lowest point `lift` above the tail's top edge, its tip `tipPast` beyond the cheek
    var r = pw.w / 2, dr = pw.dir * RAD, ax = [Math.cos(dr), Math.sin(dr)], nm = [Math.sin(dr), -Math.cos(dr)];
    var cheekX = hp(ho, [21.1, 0.5])[0], tipX = cheekX + pw.tipPast;
    var tailTopY = G - SL.tailW;
    var c = [tipX - ax[0] * r, tailTopY - pw.lift - r];
    var top = [c[0] + nm[0] * r, c[1] + nm[1] * r], tip = [c[0] + ax[0] * r, c[1] + ax[1] * r], bot = [c[0] - nm[0] * r, c[1] - nm[1] * r];
    var kU = 0.5523 * r;
    // the top line starts at the throat (inside the head's white, an open end like the stretch's arm)
    var from = hp(ho, [-6, 12]), L1 = Math.hypot(top[0] - from[0], top[1] - from[1]) / 3;
    var fromH = Math.atan2(top[1] - from[1], top[0] - from[0]) / RAD;
    var uEnd = [bot[0] - ax[0] * pw.under, bot[1] - ax[1] * pw.under];
    var pawS = chain([
      [from[0], from[1], 2 * fromH - pw.dir, 0, L1],
      [top[0], top[1], pw.dir, L1, kU],
      [tip[0], tip[1], pw.dir + 90, kU, kU],
      [bot[0], bot[1], pw.dir + 180, kU, pw.under / 3],
      [uEnd[0], uEnd[1], pw.dir + 180, pw.under / 3, 0]]);
    var pawD = D(pawS), pawW = pawD + 'Z';

    var thighD = D(chain(arcs(SL.thigh.at, SL.thigh.h, SL.thigh.arcs)));
    // the tail's top edge comes out from under the thigh: an open end in the body's white, easing down onto the level
    // band (the tail a little wider where it enters the body, as in the stretch)
    var tt = SL.tailTop, u0 = (tt.join - SL.tail.at[0]) / SL.tail.arcs[0][0], ja = at(tb.a, u0);
    var topS = chain([[tt.at[0], tt.at[1], tt.h, 0, tt.k], [ja[0], ja[1], 0, tt.k, 0]]);
    var backD = D(topS) + cOf(cut(tb.a, u0, tb.a.length)) + cOf(tb.cap) + cOf(rev(tb.b)) + cOf(back);
    // the body's white: the dome, into the head's white, down behind the paw to inside the tail's band, back to the foot
    // (under the paw it runs to the U's lowest point and down onto the tail's top edge, as the sit's white does under
    // its standing paw: only the small gap ahead of that point is paper)
    var bodyW = D(back) + 'L' + P(hp(ho, [-8, -6])) + 'L' + P(hp(ho, [6, 10])) + 'L' + P([c[0] - 4, c[1]]) +
      'L' + P([c[0], c[1] + r - 0.3]) + 'L' + P([c[0], tailTopY + 0.3]) + 'L' + P([c[0] - 4, G - 4]) + 'L' + P([F[0] + 2, G - 4]) + 'Z';
    var tailW = D(tb.a) + cOf(tb.cap) + cOf(rev(tb.b)) + 'Z';
    ho.eyes = 'closed';
    var out = [kit.fill(Bw(bodyW)), kit.fill(Bw(tailW)), K.line(Bw(thighD)), K.line(Bw(backD))];
    out = out.concat(K.part('head', ho));
    out.push(kit.fill(pawW), K.line(pawD));
    // three z's, a third of a loop apart, rising along a soft curve; each grows as it rises, comes in faint on its first
    // frame and fades on its last (so two full z's and a third, small and new or big and fading, are always there)
    for (var i = 0; i < 3; i++) {
      var u = (t + i / 3) % 1, z0 = SL.z0, z1 = SL.z1;
      var cc = [z0[0] + (z1[0] - z0[0]) * u + 2.5 * Math.sin(u * Math.PI), z0[1] + (z1[1] - z0[1]) * u];
      var sz = SL.zSize[0] + (SL.zSize[1] - SL.zSize[0]) * u;
      var fade = u > 0.8 ? 'rgba(74,36,51,0.4)' : u < 0.1 ? 'rgba(74,36,51,0.62)' : 'k';
      out.push(K.line(zee(cc, sz), { boil: 0.5, w: 0.9, c: fade }));
    }
    return out;
  } });
  // ---------------------------------------------------------------------------------------------- hammock
  /* The cat napping in a sky-soft sling between two thin ropes from the top corners: it lies on its belly, sunk in the
     cloth, its rump a round mound at the left, its back easing down into a short soft neck under the round of its skull
     (the model's nape S); its chin rests on a front leg draped over the rim at the right, the paw hanging relaxed; the
     tail comes out from under the rump, over the rim, and hangs in a J. The cat is at the stretch's scale (head s 1, leg
     10 wide, tail 10): a long, lean body lying along the sling. Strokes, back to front:
       ROPES  weight 1, from the fixed top corners to just inside each gathered tip, under the cloth's fill;
       the body's white, then the head in skull mode with the back as its lead, ONE stroke: from the rim (a T, the rump
              rising off it steeply) round the rump, over the mound, gently down into the neck's dip and up into the
              nape along the skull's own line, over the ears, round the cheek to the chin (behind the arm);
       the cloth's fill, then its outline (near rim, underside, the gathered tips) drawn as the open pieces that show:
              where it passes behind the leg or the tail it stops ON that part's line, 0.5 under its white;
       the TAIL, both edges starting just above the rim (open, in the body's white), over it and down in one J;
       the ARM, in front of the jaw and the cloth: its top line from the throat under the face, over the rim and down
              the leg's outer side, round the paw's U and up the inner side to just above the rim; two small toe hooks.
     Motion: the hammock swings on its ropes, which keep their length (the two ropes and the cloth are a four-bar
     linkage): it tilts ±1.1° and drifts ±4.3 units sideways, at most about 4 units a frame; the tail trails it by a frame
     and turns ±3° more about its root. */
  var HM = {
    AL: [12, 9], AR: [228, 9],                 // the ropes' top ends (fixed)
    EL: [34, 66], ER: [206, 66],               // the cloth's gathered tips
    rim: [[58, 109], [164, 111]],              // the near rim's handles (EL -> ER): its sag a little left of the middle
    bot: [[186, 139], [58, 145]],              // the underside's handles (ER -> EL): a shallow sling under the rim
    head: { s: 1, tilt: 5, earLen: 0.92 },
    chin: [173, 84.4],                         // where the chin rests on the arm (just above the rim)
    // the back, as pen-tool nodes after the rump's T on the rim: up round the rump, the mound's top, the dip
    back: { x0: 52, h0: -70, k0: 9, mound: [76, 76.5, 0, 11, 12], inflH: 17, inflK: 11, dipH: 0, neckR: 10 },
    // the front leg draped over the rim under the chin
    arm: { from: [-5, 13], apex: [182.5, 77.2], end: [193, 89], endH: 96, tip: [185.5, 114], dir: 100, w: 10, innerTop: 1.2 },
    tail: { root: [70, 84], h: 96, arcs: [[22, 12], [20, 24], [18, 38], [16, 46]] }, tailW: 10, tailTop: 2, tailSway: 3,
    sway: 1.1
  };
  function hmRimS() { return [[HM.EL, HM.rim[0], HM.rim[1], HM.ER]]; }
  function rimY(x) { return kit.yAt(hmRimS(), x); }
  // two small curved toe hooks on a hanging paw (paw frame: tip at 0, 0, the leg running up -y), 1 unit inside the U
  function toeHooks(w) {
    var h = w / 2, out = [];
    [-1, 1].forEach(function (sd) {
      var x = sd * 0.3 * h, y0 = -(h - Math.sqrt(h * h - x * x)) * 0.92 - 1, L = 0.5 * h;
      out.push('M' + P([x, y0]) + 'C' + P([x - sd * 0.02 * h, y0 - L * 0.4]) + ' ' + P([x + sd * 0.06 * h, y0 - L * 0.8]) + ' ' + P([x + sd * 0.26 * h, y0 - L]));
    });
    return out;
  }
  function sample(segs, n) { var out = []; segs.forEach(function (sg) { for (var j = 0; j <= n; j++) out.push(bz(sg, j / n)); }); return out; }
  function inPoly(p, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  // the cloth's closed outline (rim, then underside) drawn as the open pieces that show: wherever it passes behind a
  // part (the leg, the tail) it stops ON that part's line, 0.5 under its white, so no line ever peeks inside a part
  function visiblePieces(O, polys) {
    var N = 900, L = O.length, inside = [];
    for (var k = 0; k <= N; k++) { var p = at(O, k * L / N); inside.push(polys.some(function (q) { return inPoly(p, q); })); }
    var pieces = [], st = null;
    for (k = 0; k <= N; k++) {
      if (!inside[k] && st === null) st = k;
      if ((inside[k] || k === N) && st !== null) { pieces.push([st, inside[k] ? k : N]); st = null; }
    }
    // a piece that runs off the end joins the one that starts at 0 (the outline is a loop)
    if (pieces.length > 1 && pieces[0][0] === 0 && pieces[pieces.length - 1][1] === N) { var last = pieces.pop(); pieces[0] = [last[0] - N, pieces[0][1]]; }
    var OO = O.concat(O);
    return pieces.map(function (pc) {
      var u0 = pc[0] * L / N, u1 = pc[1] * L / N;
      if (u0 < 0) { u0 += L; u1 += L; }
      var a0 = u0 > 0 ? walk(OO, u0, -0.5) : u0, a1 = pc[1] < N ? walk(OO, u1, 0.5) : u1;
      return D(cut(OO, Math.max(0, a0), a1));
    });
  }
  // the hammock's pose on its ropes: the cloth turned by a degrees, moved so both ropes keep their length (Newton)
  function hang(a) {
    var EL = HM.EL, ER = HM.ER, AL = HM.AL, AR = HM.AR, M = [(EL[0] + ER[0]) / 2, (EL[1] + ER[1]) / 2];
    var LL = Math.hypot(EL[0] - AL[0], EL[1] - AL[1]), LR = Math.hypot(ER[0] - AR[0], ER[1] - AR[1]);
    var v = [0, 0];
    function T(p) { var q = rot(p, M, a); return [q[0] + v[0], q[1] + v[1]]; }
    function F(w) { var s = v; v = w; var l = T(EL), r = T(ER); v = s; return [Math.hypot(l[0] - AL[0], l[1] - AL[1]) - LL, Math.hypot(r[0] - AR[0], r[1] - AR[1]) - LR]; }
    for (var it = 0; it < 20; it++) {
      var f = F(v), e = 1e-4, fx = F([v[0] + e, v[1]]), fy = F([v[0], v[1] + e]);
      var j11 = (fx[0] - f[0]) / e, j12 = (fy[0] - f[0]) / e, j21 = (fx[1] - f[1]) / e, j22 = (fy[1] - f[1]) / e, det = j11 * j22 - j12 * j21;
      if (Math.abs(det) < 1e-12) break;
      v = [v[0] - (j22 * f[0] - j12 * f[1]) / det, v[1] - (-j21 * f[0] + j11 * f[1]) / det];
    }
    return T;
  }
  I.define('hammock', { w: 240, h: 170, draw: function (t, K) {
    var T = hang(K.wave(t, HM.sway, 0.25));
    // the head: its chin resting on the arm just above the rim
    var ho = {}; for (var k in HM.head) ho[k] = HM.head[k];
    var A0 = K.part('head', { x: 0, y: 0, s: ho.s, tilt: ho.tilt, skull: true, anchors: true });
    ho.x = HM.chin[0] - A0.chin[0]; ho.y = HM.chin[1] - A0.chin[1];
    var A = K.part('head', { x: ho.x, y: ho.y, s: ho.s, tilt: ho.tilt, skull: true, anchors: true });
    // the back: off the rim as a T (0.4 under it, the cloth's fill hides that end), round the rump, over the mound,
    // down into the dip and up into the nape along the skull's own line
    var bk = HM.back, N = A.nape, nh = A.napeHeading, x0 = bk.x0, y0 = rimY(x0);
    var p0 = [x0 - Math.cos(bk.h0 * RAD) * 0.4, y0 - Math.sin(bk.h0 * RAD) * 0.4];
    // the neck: ONE even concave arc (radius neckR) from the dip (heading dipH) up into the nape along the skull's line
    var h0r = bk.dipH * RAD, h1r = nh * RAD, nr = bk.neckR;
    var dip = [N[0] - nr * (Math.sin(h0r) - Math.sin(h1r)), N[1] - nr * (Math.cos(h1r) - Math.cos(h0r))];
    var kN = 4 / 3 * Math.tan(Math.abs(nh - bk.dipH) * RAD / 4) * nr, md = bk.mound;
    // between the mound and the dip, an inflection halfway (nearly straight on both sides)
    var inf = [(md[0] + dip[0]) / 2, (md[1] + dip[1]) / 2];
    var back = chain([[p0[0], p0[1], bk.h0, 0, bk.k0], md, [inf[0], inf[1], bk.inflH, bk.inflK, bk.inflK], [dip[0], dip[1], bk.dipH, bk.inflK, kN], [N[0], N[1], nh, kN, 0]]);
    ho.eyes = 'closed'; ho.skull = true; ho.lead = D(back);
    // the arm: top line from the throat, under the face, over the rim, down the leg's outer side, round the paw, up the
    // inner side to just above the rim
    var am = HM.arm, hw = am.w / 2, dr = am.dir * RAD, ax = [Math.cos(dr), Math.sin(dr)], lf = [ax[1], -ax[0]];
    var c = [am.tip[0] - ax[0] * hw, am.tip[1] - ax[1] * hw];
    var uo = [c[0] + lf[0] * hw, c[1] + lf[1] * hw], ui = [c[0] - lf[0] * hw, c[1] - lf[1] * hw], kU = 0.5523 * hw;
    var from = hp(ho, am.from), ap = am.apex, en = am.end;
    var innerX = ui[0] - 1.2, innerTop = [innerX, rimY(innerX) - am.innerTop];
    var Lf = Math.hypot(ap[0] - from[0], ap[1] - from[1]), fh = Math.atan2(ap[1] - from[1], ap[0] - from[0]) / RAD;
    var kAp = hArc(Math.hypot(en[0] - ap[0], en[1] - ap[1]), 0, am.endH);
    var Lo = Math.hypot(uo[0] - en[0], uo[1] - en[1]) / 3, Li = Math.hypot(innerTop[0] - ui[0], innerTop[1] - ui[1]) / 3;
    var armS = chain([
      [from[0], from[1], 2 * fh, 0, Lf / 3],
      [ap[0], ap[1], 0, Lf / 3, kAp],
      [en[0], en[1], am.endH, kAp, Lo],
      [uo[0], uo[1], am.dir, Lo, kU],
      [am.tip[0], am.tip[1], am.dir + 90, kU, kU],
      [ui[0], ui[1], am.dir + 180, kU, Li],
      [innerTop[0], innerTop[1], -87, Li, 0]]);
    var armD = D(armS);
    // the arm's white: the leg (over the cloth) and the forearm down to 1.5 above the rim (the rim stays drawn there)
    var armW = armD;
    for (var x = innerX - 2; x > from[0] + 2; x -= 4) armW += 'L' + P([x, rimY(x) - 1.5]);
    armW += 'L' + P([from[0] + 1, from[1] + 2]) + 'Z';
    // the body's white: the back, into the head's white, down under the rim (the cloth hides it), back under the rim
    // (on under the forearm to inside the leg, so no paper shows between the arm's white and the rim)
    var bx = innerX + 3;
    var bodyW = D(back) + 'L' + P(hp(ho, [-10, 6])) + 'L' + P(hp(ho, [8, 14])) + 'L' + P([bx, ap[1] + 4]) + 'L' + P([bx, rimY(bx) + 4]);
    for (x = bx - 6; x > x0; x -= 6) bodyW += 'L' + P([x, rimY(x) + 4]);
    bodyW += 'L' + P([x0, y0 + 4]) + 'Z';
    // the cloth
    var rimS = hmRimS(), botS = [[HM.ER, HM.bot[0], HM.bot[1], HM.EL]];
    var clothD = D(rimS) + cOf(botS) + 'Z';
    // the tail: out from under the rump, over the rim, down in one J; it trails the hammock by a frame and turns more
    var ts = K.wave(t, HM.tailSway, 0.25 - 1 / 6), tl = HM.tail;
    var tn = arcs(tl.root, tl.h, tl.arcs);
    tn = tn.map(function (n, i) { if (!i) return n.slice(); var f = Math.min(1, i / 2), p = rot([n[0], n[1]], tl.root, ts * f), q = n.slice(); q[0] = p[0]; q[1] = p[1]; q[2] += ts * f; return q; });
    var tbT = kit.tube(chain(tn), HM.tailW);
    // each edge starts tailTop above its own rim crossing
    function startAt(edge) { for (var u = 0; u < edge.length; u += 0.002) { var p = at(edge, u); if (rimY(p[0]) - p[1] <= HM.tailTop) return u; } return 0; }
    var sA = startAt(tbT.a), sB = startAt(tbT.b);
    var tlD = D(cut(tbT.a, sA, tbT.a.length)) + cOf(tbT.cap) + cOf(rev(cut(tbT.b, sB, tbT.b.length)));
    var tlW = D(tbT.a) + cOf(tbT.cap) + cOf(rev(tbT.b)) + 'Z';
    var tail = [kit.fill(tlW), K.line(tlD)];
    var O = rimS.concat(botS), polys = [sample(kit.segs(armW), 12), sample(kit.segs(tlW), 12)];
    var clothS = [kit.fill(clothD, 'ss')].concat(visiblePieces(O, polys).map(function (d) { return K.line(d); }));
    var leg = [kit.fill(armW), K.line(armD)];
    toeHooks(am.w).forEach(function (d) { leg.push(K.line(K.xf(d, { r: am.dir - 90, x: am.tip[0], y: am.tip[1] }), { w: 0.8, boil: 0.45 })); });
    var cat = [kit.fill(bodyW)].concat(K.part('head', ho));
    // the ropes, from the fixed top corners to just inside the swaying gathered tips (the cloth's fill hides that end)
    function rope(A1, E) { var e = T(E), d = Math.hypot(e[0] - A1[0], e[1] - A1[1]), kk = 1 + 0.6 / d; return K.line('M' + P(A1) + 'L' + P([A1[0] + (e[0] - A1[0]) * kk, A1[1] + (e[1] - A1[1]) * kk])); }
    var ropes = [rope(HM.AL, HM.EL), rope(HM.AR, HM.ER)];
    return ropes.concat(kit.move(cat.concat(clothS, tail, leg), T));
  } });
})();

// ---------------------------------------------------------------- poses-d
/* Health Class cat · group D, props 1: read, write, selfie (200 x 200 each), built on parts.js. Load after engine.js and
   parts.js:
     node render.mjs --files engine.js,parts.js,poses-model.js,poses-d.js --poses read,write,selfie --out out/poses-d.png

   All three sit on the model's `sit` at the lift's placement (y 182), so the head, face, pen, body, haunch and tail are
   the model's own. The props are line drawings in the same pen with one flat sky accent each (the book's cover, the
   notebook's cover peeking out behind its page, the phone's back). Every prop part is a K.shape: the engine boils its
   fill and its line from the same points, so no colour or white ever shows past a line (no offset print). Local
   helpers only add what the parts do not have:
   - read and write: the head bows 11 degrees, turning about the model's nape (the neck keeps the lift's soft S) and set
     1.4 further forward (4 forward and 5 down of the model's place); the eyes are downcast: the model's dots, 0.6 lower
     (within the head part's look range of 1.6), each under a lowered lid, so the line of sight drops onto the page;
     the blink closes them into the model's lids;
   - the chest leaves the chin at the model's 54 degrees and bows out (the model's swell) before the prop or the arm
     meets it, or the prop sits right under the chin (read), so the jaw never closes a pointed V with a straight stub;
   - read and write: both front paws are busy, so the sit is drawn with near: false, far: false and the near HIND FOOT
     shows, lying forward under the belly, coming out from behind the thigh (the family's foot, as in cheer): its sole
     and top start ON the model's haunch crease (one even arc), as covered T's; no toe tick (MODEL 3); 6.5 units of
     clear paper over the tail's top line, which starts under the toe;
   - forearms as even bands (the tail part's construction: two parallel lines open at the root, a round paw end), each
     an even arc (chord heading = the mean of its end headings), each a K.shape too, so its white meets its line
     exactly (the body lines it crosses end under it, no halo inside a paw on a prop, no rim on a dark screen). */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit, rot = kit.rot, P = kit.P, RAD = Math.PI / 180;

  // ---------------------------------------------------------------------------------------------- small geometry
  function add(p, v, k) { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function unit(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function leftOf(t) { return [t[1], -t[0]]; }
  function vec(deg, l) { l = l == null ? 1 : l; return [Math.cos(deg * RAD) * l, Math.sin(deg * RAD) * l]; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function hdg(v) { return Math.atan2(v[1], v[0]) / RAD; }
  function near(a, b, e) { return Math.abs(a[0] - b[0]) < (e || 0.05) && Math.abs(a[1] - b[1]) < (e || 0.05); }
  function bz(s, t) {
    var u = 1 - t;
    return [u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
      u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1]];
  }
  function dbz(s, t) {
    var u = 1 - t, a = sub(s[1], s[0]), b = sub(s[2], s[1]), c = sub(s[3], s[2]);
    return [3 * (u * u * a[0] + 2 * u * t * b[0] + t * t * c[0]), 3 * (u * u * a[1] + 2 * u * t * b[1] + t * t * c[1])];
  }
  function cOf(segs) { return kit.d(segs).replace(/^M[^C]*/, ''); }
  function copy(st) { var c = {}; for (var k in st) c[k] = st[k]; return c; }
  function withD(st, d) { var c = copy(st); c.d = d; return c; }
  function keepAt(out, list) { out.at = list.at; return out; }
  // the sit's long pen stroke (tail, back, head, chest) is the longest line of its list
  function mainLine(list) {
    var best = -1, n = 0;
    list.forEach(function (s, i) { if (s.t === 'line' && s.d.length > n) { n = s.d.length; best = i; } });
    return best;
  }
  // a chain sampled finely: [{ p, u (segment index + t), s (arc length) }]
  function samples(segs, n) {
    n = n || 40; var out = [], s = 0, prev = null;
    segs.forEach(function (sg, i) {
      for (var j = (i ? 1 : 0); j <= n; j++) {
        var p = bz(sg, j / n); if (prev) s += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
        out.push({ p: p, u: i + j / n, s: s }); prev = p;
      }
    });
    return out;
  }
  // where along a chain (u in segments) the arc length reaches L
  function uAtLen(segs, L) { var sm = samples(segs, 40); for (var i = 0; i < sm.length; i++) if (sm[i].s >= L) return sm[i].u; return segs.length; }

  // ---------------------------------------------------------------------------------------------- the head and face
  // the head turned by `tilt` about the model's nape: the head's centre offset that keeps the nape where it is at tilt 0
  function aboutNape(tilt) {
    var n = [-21.4 * 1.18, 13.6 * 1.18], q = rot(n, [0, 0], tilt);
    return [n[0] - q[0], n[1] - q[1]];
  }
  // a point in the head's own units (x right, y down, before tilt and scale) in canvas units
  function hp(at, tilt, p) {
    var s = at.headS, c = Math.cos(tilt * RAD), sn = Math.sin(tilt * RAD);
    return [at.head[0] + s * (p[0] * c - p[1] * sn), at.head[1] + s * (p[0] * sn + p[1] * c)];
  }
  var EYES = [[1.9, 0.8, 1.6], [16.9, -0.8, 1.5]];     // the head part's eyes: x, y, r (head units)
  function noDots(list) { return keepAt(list.filter(function (s) { return s.t !== 'dot'; }), list); }
  /* Downcast eyes (read, write): each eye is the model's dot moved dy down (within the head part's look range), its top
     cut off by a lowered lid: a half dot under a short lid line that runs on a little past it each side and droops at
     its ends, so the eye reads as looking down even at 92 px. Closed (the blink): the model's own closed lid at the
     same place. */
  function downcast(K, at, tilt, o) {
    var out = [], dy = o.dy || 0, dx = o.dx || 0;
    EYES.forEach(function (e) {
      var r = e[2], x = e[0] + dx, y = e[1] + dy;
      function C(p) { return P(hp(at, tilt, p)); }
      if (o.closed) {
        var hw = r * 1.3;
        out.push(K.line('M' + C([x - hw, y - 0.1]) + 'C' + C([x - hw * 0.5, y + hw * 0.62]) + ' ' + C([x + hw * 0.5, y + hw * 0.62]) + ' ' + C([x + hw, y - 0.1]), { w: 0.9, boil: 0.4 }));
        return;
      }
      var R = r * 1.05, y0 = y - 0.3 * r, lw = r * 1.5, k = 0.552 * R;
      out.push(K.shape('M' + C([x - R, y0]) + 'C' + C([x - R, y0 + k]) + ' ' + C([x - k, y0 + R]) + ' ' + C([x, y0 + R]) +
        'C' + C([x + k, y0 + R]) + ' ' + C([x + R, y0 + k]) + ' ' + C([x + R, y0]) + 'Z', 'k', { w: 0.4, boil: 0.3 }));
      out.push(K.line('M' + C([x - lw, y0 + 0.5 * r]) + 'C' + C([x - lw * 0.6, y0 - 0.32 * r]) + ' ' + C([x + lw * 0.6, y0 - 0.32 * r]) + ' ' + C([x + lw, y0 + 0.5 * r]), { w: 0.9, boil: 0.4 }));
    });
    return out;
  }

  // ---------------------------------------------------------------------------------------------- the hind foot
  /* Both front paws busy (read, write): the sit is drawn with near: false, far: false, so its chest line stops under the
     chest. The near hind foot then shows, lying forward on the ground, toes to the right, coming out from BEHIND the
     thigh (the family's foot, as in cheer): its sole and its top line both start ON the thigh's front edge (the model's
     haunch crease, one even arc, run on a little toward the ground), as covered T's: the foot is drawn first, then a
     strip of the thigh's own white (left of the crease, inside the body) hides both 0.4-unit overshoots, then the crease
     line. The toe is one round cubic (an even half circle). No toe tick (MODEL 3: the foot is near the tail's line). The
     foot sits 6.5 units over the tail's top line, so clear paper shows between them at 72 px; the tail's top line
     starts under the toe. The chest runs on (the same pen stroke) as the belly, down onto the top of the foot near the
     toe: a T, its end under the foot's white, drawn after it. The body's white is rebuilt along the new chest and belly,
     so no white lies past a line. `chest`: pen-tool nodes from the chin (its first node's x, y are the chin) to the
     chest's lowest visible point; the belly arc runs on from there. */
  var HF = { th: 10, h: 4.6, S: [112.6, 177.2], taper: 3, tailX: 114,
    crease: [[75.5, 119, 27, 0, 13], [94.8, 146.5, 77, 9.5, 11], [92.6, 177.4, 108, 11, 0]] };
  function hindFoot(K, list, chestNodes) {
    var th = HF.th, h = HF.h, a = vec(th), nrm = leftOf(a), S = HF.S, Tp = add(S, nrm, 2 * h);
    var crease = kit.chain(HF.crease), cpoly = samples(crease, 40).map(function (x) { return x.p; });
    // where a straight ray from p heading `deg` meets the crease (the nearest crossing)
    function onCrease(p, deg) {
      var v = vec(deg), best = null;
      for (var k = 0; k + 1 < cpoly.length; k++) {
        var c = cpoly[k], q = sub(cpoly[k + 1], c), den = v[0] * q[1] - v[1] * q[0]; if (Math.abs(den) < 1e-9) continue;
        var t = ((c[0] - p[0]) * q[1] - (c[1] - p[1]) * q[0]) / den, u = ((c[0] - p[0]) * v[1] - (c[1] - p[1]) * v[0]) / den;
        if (t > 0 && u >= 0 && u <= 1 && (!best || t < best.t)) best = { t: t, p: add(p, v, t) };
      }
      return best.p;
    }
    var solDeg = th + 180, topDeg = th + 180 - HF.taper;
    var P0 = add(onCrease(S, solDeg + 1.5), vec(solDeg + 1.5), 0.4), P1 = add(onCrease(Tp, topDeg - 2), vec(topDeg - 2), 0.4);
    var Ls = Math.hypot(S[0] - P0[0], S[1] - P0[1]), Lt = Math.hypot(Tp[0] - P1[0], Tp[1] - P1[1]), kU = 4 / 3 * h;
    var fs = kit.chain([[P0[0], P0[1], th + 3, 0, Ls * 0.36], [S[0], S[1], th, Ls * 0.36, kU, th], [Tp[0], Tp[1], th + 180, kU, Lt * 0.36],
      [P1[0], P1[1], topDeg + 2, Lt * 0.36, 0]]);
    var top = fs[2];
    // one K.shape (its white and its line boil from the same points); the closing run between the two ends lies inside
    // the thigh, under the thigh's white strip drawn next
    var foot = [K.shape(kit.d(fs) + 'Z', 'w')];
    // the strip of the thigh's white over the two T's (its straight edges lie in the body's white), then the crease
    var cs = samples(crease, 40), y0 = P1[1] - 4;
    var pts = cs.filter(function (x) { return x.p[1] >= y0; }).map(function (x) { return x.p; });
    var strip = 'M' + pts.map(P).join('L') + 'L' + P(add(pts[pts.length - 1], [-4, 0])) + 'L' + P(add(pts[0], [-5, 0])) + 'Z';
    var thigh = [kit.fill(strip), K.line(kit.d(crease))];
    // the main stroke: everything up to the chin as the sit drew it, then the new chest, then the belly onto the foot
    var i = mainLine(list), segs = kit.segs(list[i].d), chin = list.at.chin, ic = -1;
    for (var j = 0; j < segs.length; j++) if (near(segs[j][0], chin, 0.08)) ic = j;
    var cn = chestNodes.map(function (n) { return n.slice(); }); cn[0][0] = chin[0]; cn[0][1] = chin[1];
    var chest = kit.chain(cn), last = chest[chest.length - 1], E = last[3], e0 = unit(dbz(last, 1));
    var B = bz(top, 0.2), nB = leftOf(unit(dbz(top, 0.2))), end = add(B, nB, -0.4);   // -nB: into the foot
    var h0 = hdg(e0), ch = hdg(sub(end, E)), bl = Math.hypot(end[0] - E[0], end[1] - E[1]) * 0.36;
    var belly = kit.chain([[E[0], E[1], h0, 0, bl], [end[0], end[1], 2 * ch - h0, bl, 0]]);
    var front = chest.concat(belly);
    var body = segs.slice(0, ic);
    // the tail's top line starts under the toe, not under the heel: cut the long stroke's first segment there
    var s0 = body[0], u0 = 0;
    for (var q = 0; q <= 1; q += 0.005) if (bz(s0, q)[0] <= HF.tailX) u0 = q;
    if (u0 > 0.9) body.shift(); else body[0] = kit.cut([s0], u0, 1)[0];   // never a stub shorter than the boil can hold
    var out = [];
    list.forEach(function (st, k) {
      if (st.t === 'line' && /^M75\.5 /.test(st.d)) return;           // the sit's haunch crease: redrawn after the foot
      out.push(k === i ? withD(st, kit.d(body.concat(front))) : st);
    });
    // the body's white: the back (as the sit built it), the straight run inside the tail's band and along its top line
    // to under the toe, up into the foot, up the belly and the new chest to the chin
    var Cu = add(S, nrm, h), ws = kit.segs(list[0].d.replace(/Z$/, '')), path = kit.d(ws.slice(0, 3)), low = add(Cu, nrm, -(h - 0.3));
    ws.slice(3).forEach(function (s) { var p = s[3]; if (p[0] < low[0] - 0.3 && p[1] > 175) path += 'L' + P(p); });
    path += 'L' + P([low[0], 182.1]) + 'L' + P(low) + 'L' + P(Cu) + 'L' + P(end);
    // along the new chest and belly the white keeps 0.2 inside the line (its centre), so the pen's tremble never
    // shows a white rim past it on a dark screen
    var inner = kit.tube(front, 0.4).b;
    path += 'L' + P(inner[inner.length - 1][3]) + cOf(kit.rev(inner)) + 'L' + P([112, 72]) + 'Z';
    out[0] = withD(list[0], path);
    return { list: keepAt(out, list), foot: foot, thigh: thigh, chest: chest };
  }

  // ---------------------------------------------------------------------------------------------- forearms
  /* Two toe hooks on a raised paw, 1.1 units inside the U, each a small curved hook. tip = the U's round end, t = the
     leg's direction toward the tip (unit). */
  function hooks(K, tip, t, w) {
    var lx = leftOf(t), h = w / 2, out = [];
    function toC(p) { return [tip[0] + lx[0] * p[0] + t[0] * p[1], tip[1] + lx[1] * p[0] + t[1] * p[1]]; }
    [-0.32, 0.32].forEach(function (f) {
      var x = f * h, y0 = -(h - Math.sqrt(h * h - x * x)) * 0.92 - 1.1, k = h * 0.5;
      var pts = [[x, y0], [x + 0.05, y0 - k * 0.45], [x - 0.12, y0 - k * 0.8], [x - 0.62, y0 - k]].map(toC);
      out.push(K.line('M' + P(pts[0]) + 'C' + P(pts[1]) + ' ' + P(pts[2]) + ' ' + P(pts[3]), { w: 0.8, boil: 0.45 }));
    });
    return out;
  }
  /* A forearm as an even band along pen-tool nodes [x, y, heading, hIn, hOut] from its root to the centre of its paw's
     U: the tail part's band (two parallel lines, a round paw end) drawn as ONE K.shape whose path is left open at the
     root: SVG fills an open path as if closed, straight across, while its stroke stays open, so the arm is open at the
     root AND its white and its line boil from the same points (the white reaches the line's centre everywhere: no
     colour halo inside a paw lying on a prop, no white rim past it on a dark screen). Each line starts at stopA / stopB
     (in segments along it). o.rootW: a white over the band's first rootW units, drawn first, so a body line crossing
     under the root (selfie's chest) is covered before the lines start. o.toes: 0 for a clean round paw (default 2
     hooks). Returns the strokes with .band = { a, b, center, w }, .tip and .dir (canvas units). */
  function arm(K, nodes, o) {
    o = o || {};
    var w = o.w || 11, ch = kit.chain(nodes), tb = kit.tube(ch, w), C = tb.center, L = C[C.length - 1], n = tb.a.length;
    var t = unit(dbz(L, 1)), tip = add(L[3], t, w / 2), list = [];
    if (o.rootW) {
      var wr = kit.tube(ch, w + 0.2), u = uAtLen(C, o.rootW), A = kit.cut(wr.a, 0, u), Bs = kit.cut(wr.b, 0, u);
      list.push(kit.fill(kit.d(A) + 'L' + P(Bs[Bs.length - 1][3]) + cOf(kit.rev(Bs)) + 'Z'));
    }
    list.push(K.shape(kit.d(kit.cut(tb.a, o.stopA || 0, n)) + cOf(tb.cap) + cOf(kit.rev(kit.cut(tb.b, o.stopB || 0, n))), 'w'));
    if (o.toes !== 0) list = list.concat(hooks(K, tip, t, w));
    list.band = { a: tb.a, b: tb.b, center: C, w: w };
    list.tip = tip; list.dir = t;
    return list;
  }
  // where along an edge (u in segments, 0 at the root) a line should start so that it begins `over` units inside a band
  // drawn after it (its root hidden under that band's white)
  function startIn(edge, band, over) {
    var hw = band.w / 2 - over, best = 0;
    function inside(p) {
      for (var i = 0; i < band.center.length; i++) for (var j = 2; j <= 40; j++) {
        var q = bz(band.center[i], j / 40);
        if (Math.hypot(p[0] - q[0], p[1] - q[1]) <= hw) return true;
      }
      return false;
    }
    for (var u = 0; u <= edge.length; u += 0.005) {
      var s = Math.min(edge.length - 1, Math.floor(u)), p = bz(edge[s], u - s);
      if (inside(p)) best = u; else if (best > 0 || u > 0.05) break;
    }
    return best;
  }

  // ---------------------------------------------------------------------------------------------- rounded polygons
  /* A closed polygon (points in order, either way round) with some corners rounded (radii[i] > 0: one cubic each, an
     even arc with handles 4/3 tan(turn/4) r, like a quarter round) and the rest sharp, offset k outward (k < 0: inward;
     a rounded corner keeps its centre, its radius grows by k). Straight sides are L (only their ends tremble). It starts
     and closes at fraction f along side `start` (from point start to point start + 1): put that seam under a paw. */
  function split2(sg) {
    var a = lerp(sg[0], sg[1], 0.5), b = lerp(sg[1], sg[2], 0.5), c = lerp(sg[2], sg[3], 0.5), d = lerp(a, b, 0.5), e = lerp(b, c, 0.5), f = lerp(d, e, 0.5);
    return [[sg[0], a, d, f], [f, e, c, sg[3]]];
  }
  function roundPoly(pts, radii, k, start, f) {
    var n = pts.length, area = 0, i;
    for (i = 0; i < n; i++) { var a0 = pts[i], b0 = pts[(i + 1) % n]; area += a0[0] * b0[1] - b0[0] * a0[1]; }
    var sg = area > 0 ? 1 : -1, D = [], V = [], A = [], B = [], CC = [];
    for (i = 0; i < n; i++) D.push(unit(sub(pts[(i + 1) % n], pts[i])));
    function isect(p, u, q, v) { var den = u[0] * v[1] - u[1] * v[0]; if (Math.abs(den) < 1e-9) return p; var s = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / den; return [p[0] + s * u[0], p[1] + s * u[1]]; }
    for (i = 0; i < n; i++) {
      var dp = D[(i - 1 + n) % n], dn = D[i], np = leftOf(dp), nn = leftOf(dn);
      var pp = add(pts[i], np, sg * k), pn = add(pts[i], nn, sg * k), v = isect(pp, dp, pn, dn);
      V.push(v);
      var r = (radii[i] || 0);
      if (r > 0) {
        var turn = Math.acos(Math.max(-1, Math.min(1, dp[0] * dn[0] + dp[1] * dn[1]))), R = r + k, tl = R * Math.tan(turn / 2), hl = 4 / 3 * Math.tan(turn / 4) * R;
        var Ai = add(v, dp, -tl), Bi = add(v, dn, tl);
        A.push(Ai); B.push(Bi); CC.push([Ai, add(Ai, dp, hl), add(Bi, dn, -hl), Bi]);
      } else { A.push(v); B.push(v); CC.push(null); }
    }
    var s0 = start || 0, d, m, c;
    if (f != null && f < 0 && CC[s0]) {
      // the seam in the middle of corner s0's arc
      var hc = split2(CC[s0]);
      d = 'M' + P(hc[1][0]) + 'C' + P(hc[1][1]) + ' ' + P(hc[1][2]) + ' ' + P(hc[1][3]);
      for (m = 1; m < n; m++) { c = (s0 + m) % n; d += 'L' + P(A[c]); if (CC[c]) d += 'C' + P(CC[c][1]) + ' ' + P(CC[c][2]) + ' ' + P(CC[c][3]); }
      return d + 'L' + P(A[s0]) + 'C' + P(hc[0][1]) + ' ' + P(hc[0][2]) + ' ' + P(hc[0][3]) + 'Z';
    }
    var S = lerp(B[s0], A[(s0 + 1) % n], f == null ? 0.5 : f);
    d = 'M' + P(S);
    for (m = 1; m <= n; m++) {
      c = (s0 + m) % n;
      d += 'L' + P(A[c]);
      if (CC[c]) d += 'C' + P(CC[c][1]) + ' ' + P(CC[c][2]) + ' ' + P(CC[c][3]);
    }
    return d + 'Z';
  }

  // ---------------------------------------------------------------------------------------------- read
  /* The open book seen from behind its covers, held up under the chin: a sky cover folded at the spine (a shallow
     chevron, the near half wider in 3/4) with its four outer corners rounded like the notebook's and the phone's, the
     pages' top edges two soft humps above it, a short free spine line. Local units, spine at x 0. Each part is a
     K.shape (the engine boils its fill and its line from the same points, so no white or sky ever shows past a line):
     the pages (their top edges, then a closing run down inside the cover, which its sky hides), the cover (its seam in
     the middle of the lower left corner, under the near paw), the spine. Everything boils at 0.6 like the other props.
     o.lift (degrees): the right page turns up about the gutter, rigidly (the hump keeps its shape), and its outer edge
     shows from the lifted corner down to the cover; the left page never moves. */
  var BK = { TL: [-23, -12.5], ST: [0, -10], TR: [18, -13.2], BR: [18, 13], SB: [0, 16.2], BL: [-23, 13.4], r: 2.8 };
  function book(K, o) {
    var L = o.lift || 0, TL = BK.TL, ST = BK.ST, TR = BK.TR, BR = BK.BR, SB = BK.SB, BL = BK.BL;
    function on(a, b, f, dn) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + (dn || 0)]; }
    var p1 = on(ST, TR, 0.84, 0.45), g = [0, ST[1] + 0.6];
    function lf(p) { return rot(p, g, -L); }
    function pages() {
      var p0 = on(TL, ST, 0.13, 0.45), pk = [8.8, -16.3], c1 = lf(p1), side = '';
      // the page's outer edge, from its lifted corner (a real corner, one node) down onto the cover's top edge
      if (L > 0.3) { var dv = sub(p1, c1); side = 'C' + P(add(c1, [dv[0] / 3 + 0.35, dv[1] / 3])) + ' ' + P(add(c1, [dv[0] * 2 / 3 + 0.3, dv[1] * 2 / 3])) + ' ' + P(p1); }
      return 'M' + P(p0) + 'C' + P([-19.6, -15]) + ' ' + P([-15.4, -16.4]) + ' ' + P([-11, -16.3]) +
        'C' + P([-6, -16.2]) + ' ' + P([-1.4, -13.6]) + ' ' + P(g) +
        'C' + P(lf([1.3, -13.6])) + ' ' + P(lf([pk[0] - 4.2, pk[1] + 0.1])) + ' ' + P(lf(pk)) +
        'C' + P(lf([pk[0] + 3.8, pk[1] - 0.1])) + ' ' + P(lf([p1[0] - 1.6, p1[1] - 1.9])) + ' ' + P(c1) + side;
    }
    var pts = [TL, ST, TR, BR, SB, BL], radii = [BK.r, 0, BK.r, BK.r, 0, BK.r];
    var cover = roundPoly(pts, radii, 0, 5, -1);
    var spine = 'M' + P([0, -5.6]) + 'C' + P([0, -0.6]) + ' ' + P([0, 5.2]) + ' ' + P([0, 10.6]);
    var X = function (d) { return K.xf(d, o); };
    // the pages as ONE shape (the engine boils its white and its line from the same points, so the white reaches the
    // line's centre everywhere: the cheek line's T on the left page is covered to the line): the top edges, then down
    // into the cover and back, a closing run that the cover's sky hides
    var pd = pages(), q1 = [p1[0], p1[1]], p0 = on(TL, ST, 0.13, 0.45);
    pd += 'L' + P([q1[0], q1[1] + 6]) + 'L' + P([p0[0], p0[1] + 6]) + 'Z';
    return [K.shape(X(pd), 'w', { boil: 0.6 }), K.shape(X(cover), 's', { boil: 0.6 }), K.line(X(spine), { w: 0.8, boil: 0.6 })];
  }
  /* Sitting, the open book held up right under the chin in both front paws, the head bowed 11 degrees over it (about
     the nape, 1.4 forward), the eyes downcast on the page. The near forearm rises from inside the body (8 units clear
     of the haunch crease) to the cover's lower left corner, its paw over it; the far forearm runs from behind the near
     forearm along under the book, one even arc, to its paw over the lower right corner. The chest leaves the chin at 54
     degrees, goes behind the left page (which never moves; the book sits right under the chin, so no stub of chest
     shows) and on below the book as the belly onto the hind foot. Motion: the right page turns up 17 degrees about the
     gutter and settles (1 - cos: frame 4 at the top; its corner moves 3.7 units in all, at most 1.9 a frame, visible at
     92 px), one blink on frame 5 (the downcast eyes close into the model's lids). */
  var RD = { tilt: 11, fwd: [1.4, 0], dy: 0.6,
    book: { x: 136, y: 95, r: -8, s: 0.82 }, lift: 17,
    chest: [[0, 0, 54, 0, 9], [139.4, 110, 90, 13, 0]],
    near: [[107, 141, -80, 0, 10], [117.8, 110.7, -61, 10, 0]],
    far: [[111, 132, -24, 0, 13], [150.4, 105.1, -42, 13, 0]] };
  I.define('read', { w: 200, h: 200, draw: function (t, K) {
    var blink = kit.blink(t), off = aboutNape(RD.tilt);
    var cat = K.part('sit', { y: 182, near: false, far: false, headDx: off[0] + RD.fwd[0], headDy: off[1] + RD.fwd[1],
      head: { eyes: 'open', tilt: RD.tilt } });
    var eyes = downcast(K, cat.at, RD.tilt, { dy: RD.dy, closed: blink });
    cat = noDots(cat);
    var hf = hindFoot(K, cat, RD.chest), lift = RD.lift * (1 - Math.cos(t * K.TAU)) / 2, b = RD.book;
    var nearA = arm(K, RD.near, { stopA: 0.12 });
    var ftb = kit.tube(kit.chain(RD.far), 11);
    var farA = arm(K, RD.far, { stopA: startIn(ftb.a, nearA.band, 0.6), stopB: startIn(ftb.b, nearA.band, 0.6) });
    return hf.list.concat(eyes, hf.foot, hf.thigh,
      book(K, { x: b.x, y: b.y, r: b.r, s: b.s, lift: lift }),
      farA, nearA);
  } });

  // ---------------------------------------------------------------------------------------------- write
  /* A small notebook, wider than tall (30 x 22), its page toward us: a white page in the pen with sharp corners, its sky
     cover peeking out behind it at the right and the bottom (no band, no rounded top), lines of writing at 0.8, 6.2
     apart (o.lines in local units: [[x0, x1, y], ...]). Local units, centre (0, 0), half sizes w, h. */
  function notebook(K, o) {
    var w = o.w, h = o.h, X = function (d) { return K.xf(d, o); }, cv = o.cover, out = [];
    // sharp corners (TL, TR, BR, BL), one closed line starting at fraction f along side `side` (0 top, 1 right, 2 bottom,
    // 3 left, each clockwise) and closing with Z straight back to that point (no second copy of it to boil apart)
    function rect(x0, y0, x1, y1, side, f) {
      var c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], d = 'M' + P(lerp(c[side], c[(side + 1) % 4], f));
      for (var i = 1; i <= 4; i++) d += 'L' + P(c[(side + i) % 4]);
      return d + 'Z';
    }
    // each a K.shape: its fill and its line boil from the same points, so no colour or white shows past a line. The
    // cover's seam lies on its top edge, hidden behind the page; the page's seam on its bottom edge under the forearm
    out.push(K.shape(X(rect(-w + cv[0], -h + cv[1], w + cv[0], h + cv[1], 0, 0.5)), 's', { boil: 0.6 }));
    out.push(K.shape(X(rect(-w, -h, w, h, 2, o.seam)), 'w', { boil: 0.6 }));
    o.lines.forEach(function (L) {
      var d = 'M' + P([L[0], L[2]]) + 'C' + P([L[0] + (L[1] - L[0]) * 0.33, L[2] - 0.4]) + ' ' + P([L[0] + (L[1] - L[0]) * 0.67, L[2] + 0.4]) + ' ' + P([L[1], L[2]]);
      out.push(K.line(X(d), { w: 0.8, boil: 0.5 }));
    });
    return out;
  }
  /* The pencil: ONE pen line (weight 1) from its top end to the point, with a small cone tick: a short line from the
     point back up beside the shaft, the open V of a sharpened point. tip, deg (from the tip toward the top end), len.
     It is 21 long so that about 9 units show above the paw and its top end clears the notebook's top edge into open
     paper: that is what makes it read as a pencil at 104 and 72 px (shorter, it hides inside the page's lines). */
  function pencil(K, tip, deg, len) {
    var u = vec(deg), n = leftOf(u), top = add(tip, u, len);
    var c1 = add(add(tip, u, 3.2), n, -1.25), a = add(tip, u, 2.6), b = add(top, u, -0.4), hw = 0.15;
    // a thin white strip under the shaft (no line of its own, inside the pen's width): the lines it lies across end
    // on it from both sides as covered T's, so the pencil passes in front of them instead of crossing them
    var halo = 'M' + P(add(a, n, hw)) + 'L' + P(add(b, n, hw)) + 'L' + P(add(b, n, -hw)) + 'L' + P(add(a, n, -hw)) + 'Z';
    return [kit.fill(halo), K.line('M' + P(top) + 'L' + P(tip), { boil: 0.6 }), K.line('M' + P(tip) + 'L' + P(c1), { w: 0.9, boil: 0.5 })];
  }
  /* Sitting with a small notebook held up in front of the chest, writing in it. The far forearm holds it from behind:
     only its paw shows, curled under the notebook's lower edge (drawn first, the notebook's white hides the rest). The
     near forearm, the only one crossing the body, rises from inside the body to the page, its paw on the pencil; the
     pencil leans back toward the cat, its shaft showing above and below the paw, its point on the line being written.
     That line runs to the LEFT of the point and stays put: it ends where the point's stroke starts, and the point runs
     its 3 units on past it (the next letter) and back. The head bowed like read's, the eyes downcast on the page.
     Motion: the point runs 3 units right and back along its line (frame 1 at the left, frame 4 at the right); the paw
     and pencil move with it, the forearm's root a third as much. */
  var WR = { tilt: 11, fwd: [1.4, 0], dy: 0.6,
    nb: { x: 147, y: 113, r: -15, w: 15, h: 11, cover: [2.6, 2.4], seam: 0.9 },
    lines: [[-11.5, 10.5, -5.4], [-11.5, 10.5, 0.8]], row: 7, x0: -11.5, tipX: 1.5, run: 3,
    pdeg: -110, plen: 21, grip: 7.7, clip: 1.0,
    chest: [[0, 0, 54, 0, 10], [139.6, 112, 92, 14, 0]],
    near: [108, 136, -44.5, 11, 11, -20],
    far: [[146, 112, 37, 0, 8], [158.6, 123.2, 46, 8, 0]] };
  I.define('write', { w: 200, h: 200, draw: function (t, K) {
    var off = aboutNape(WR.tilt);
    var cat = K.part('sit', { y: 182, near: false, far: false, headDx: off[0] + WR.fwd[0], headDy: off[1] + WR.fwd[1],
      head: { eyes: 'open', tilt: WR.tilt } });
    var eyes = downcast(K, cat.at, WR.tilt, { dy: WR.dy });
    cat = noDots(cat);
    var hf = hindFoot(K, cat, WR.chest), Q = WR.nb, ar = Q.r * RAD, c = Math.cos(ar), sn = Math.sin(ar);
    function toC(p) { return [Q.x + p[0] * c - p[1] * sn, Q.y + p[0] * sn + p[1] * c]; }
    // the point: 0 to 3 units right of where the written line ends (1 - cos: the extremes on frames 1 and 4)
    var mv = WR.run * (1 - Math.cos(t * K.TAU)) / 2, tip = toC([WR.tipX + mv, WR.row]);
    var lines = WR.lines.concat([[WR.x0, WR.tipX, WR.row]]);
    // the paw's round tip lies just past the pencil (clip units), so it covers only a short stretch of the shaft
    var N = WR.near, G = add(tip, vec(WR.pdeg, WR.grip)), E = add(G, vec(N[5]), WR.clip - 5.5), rs = [mv * c / 3, mv * sn / 3];
    var nearA = arm(K, [[N[0] + rs[0], N[1] + rs[1], N[2], 0, N[3]], [E[0], E[1], N[5], N[4], 0]], { toes: 0 });
    var farA = arm(K, WR.far, { toes: 0 });
    return hf.list.concat(eyes, hf.foot, hf.thigh, farA,
      notebook(K, { x: Q.x, y: Q.y, r: Q.r, w: Q.w, h: Q.h, cover: Q.cover, seam: Q.seam, lines: lines }),
      pencil(K, tip, WR.pdeg, WR.plen),
      nearA);
  } });

  // ---------------------------------------------------------------------------------------------- selfie
  /* A phone seen from the back (we see its back, so it is a selfie): a rounded slab, sky soft, in the pen (radius 4.6,
     boiling at 0.6), its seam in the middle of the bottom edge under the paw, and a small camera dot by its top left
     corner. */
  function phone(K, o) {
    var w = 8.2, h = 15, pts = [[-w, -h], [w, -h], [w, h], [-w, h]], rr = [4.6, 4.6, 4.6, 4.6];
    return [K.shape(K.xf(roundPoly(pts, rr, 0, 2, 0.5), o), 'ss', { boil: 0.6 }),
      K.dot.apply(null, K.xf('M' + P([-w + 3.6, -h + 3.6]), o).match(/-?[\d.]+/g).map(Number).concat([1.25]))];
  }
  /* Sitting 3/4, the near paw raised up and out holding a phone (the paw's U over the bottom of its back, the bottom
     edge meeting the paw's lines as clean T's), a wink and a smile, the open eye turned a little toward the phone; the
     far paw stands just behind the tail. The arm is a gentle arc from inside the chest; its white meets its lines exactly
     (one shape) and a root white covers its first 20 units, so the chest line passing under it is covered right up to
     the arm's lines. The chest leaves the
     chin at 54 degrees and bows out at once (the model's swell) before it meets the arm. Motion: a slight tilt back and
     forth, posing: the head rocks 2 degrees each way about 3 (the lift's own tilt), turning about the nape, so the back
     line holds still; the arm and phone sway 1.5 degrees about the arm's root, in phase. */
  var SF = { base: 3, amp: 2, look: [0.8, -0.3], arc: [-0.3, 0.1], chestH: 15.5, root: [125, 118], end: [154.6, 70.5], h0: -40, h1: -72, phone: [158.8, 57.4] };
  I.define('selfie', { w: 200, h: 200, draw: function (t, K) {
    var tl = SF.base + K.wave(t, SF.amp, 0.25), sw = K.wave(t, 1.5, 0.25), root = SF.root, off = aboutNape(tl);
    var cat = K.part('sit', { y: 182, near: false, headDx: off[0], headDy: off[1], head: { eyes: 'wink', mouth: 'smile', tilt: tl } });
    var at = cat.at, out = [], nDots = 0;
    // the chest bowed out: its first cubic (chin -> the chest's fullest) leaves the chin with a longer handle; a lens of
    // white fills the sliver between the sit's chest and the new one (drawn right after the body's white, 0.2 inside the
    // new line); the open eye moves toward the phone (dx 0.8, dy -0.3: the eye-to-nose gap stays within 6% of the
    // model's) and the wink's arc sits level with it
    var i = mainLine(cat), segs = kit.segs(cat[i].d), ic = -1;
    for (var j = 0; j < segs.length; j++) if (near(segs[j][0], at.chin, 0.08)) ic = j;
    var old = segs[ic], nw = [old[0], add(old[0], vec(54), SF.chestH), old[2], old[3]];
    segs[ic] = nw;
    cat.forEach(function (st, k) {
      if (k === i) st = withD(st, kit.d(segs));
      else if (st.t === 'dot' && !nDots++) { var q = hp(at, tl, [EYES[0][0] + SF.look[0], EYES[0][1] + SF.look[1]]); st = copy(st); st.x = q[0]; st.y = q[1]; }
      else if (st.t === 'line' && st.w === 0.9) { var v = sub(hp(at, tl, SF.arc), hp(at, tl, [0, 0])); st = withD(st, K.xf(st.d, { x: v[0], y: v[1] })); }
      out.push(st);
      if (k === 0) { var lens = kit.tube([nw], 0.4).b; out.push(kit.fill(kit.d(lens) + 'L' + P(old[3]) + cOf(kit.rev([old])) + 'Z')); }
    });
    var pc = rot(SF.phone, root, sw), e = rot(SF.end, root, sw);
    return out.concat(
      phone(K, { x: pc[0], y: pc[1], r: -8 + sw }),
      arm(K, [[root[0], root[1], SF.h0 + sw, 0, 19], [e[0], e[1], SF.h1 + sw, 19, 0]], { stopA: 0.3, rootW: 20 }));
  } });
})();

// ---------------------------------------------------------------- poses-e
/* Health Class cat · group E, props 2: bell (220 x 200), gift (200 x 200), calendar (220 x 200), built on parts.js.
   Load after engine.js and parts.js:
     node render.mjs --files engine.js,parts.js,poses-model.js,poses-e.js --poses bell,gift,calendar --out out/poses-e.png

   All three sit on the model's `sit` (same head, face, pen, paws, body and tail as `lift`, y 182). The props are drawn
   in the same pen with one flat accent each (bell: rose bells; gift: rose ribbon and bow; calendar: a rose-soft band),
   they boil less than the cat (0.5 to 0.6) so their corners stay round, and they are lighter in value than the cat.
   Local helpers only add what the parts do not have:
   - the eye dots moved past the head part's 'look' clamp (dy 1.6) by one more head unit, down and toward the prop, so
     the gaze lands on it at 96 to 132 px; the far dot keeps 2 units of paper inside the cheek. Bell and calendar bow
     the head 12 degrees (the limit), set 3 forward and 4 down;
   - neck1: under a head bowed 12 degrees the skull's tangent at the nape points straight down, so the sit's neck cubic
     (handles 17 and 16) runs down nearly flat. It is rebuilt as ONE cubic with handles 20 and 20 along the same two
     tangents: its bend runs 0.13 -> -2.46 -> -0.22 (x 0.01), the lift's own profile (0.28 -> -2.43 -> -1.32), with no
     extra node, so the boil can never make a step in it. The body's white follows the new line;
   - gift: both front paws hold the box, so the sit is drawn with near: false, far: false and the near HIND FOOT lies
     forward on the ground under the belly (the family's foot, as in read and write);
   - calendar: the raised near leg is ONE pen stroke with the chest and the far leg: down the chest, round a 7-unit
     curve onto the leg's top edge, round the paw, back along its underside into the armpit (a corner of the same
     stroke) and on down the far leg. No T, no overshoot, nothing to fork.
   Closed outlines never start and end on a visible point of a curve: rounded rectangles start mid-edge and close along
   that straight edge. */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit, rot = kit.rot, P = kit.P, RAD = Math.PI / 180;

  // ---------------------------------------------------------------------------------------------- small geometry
  function add(p, v, k) { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function unit(v) { var l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function len(v) { return Math.hypot(v[0], v[1]); }
  function leftOf(t) { return [t[1], -t[0]]; }
  function vec(deg, l) { l = l == null ? 1 : l; return [Math.cos(deg * RAD) * l, Math.sin(deg * RAD) * l]; }
  function hdg(v) { return Math.atan2(v[1], v[0]) / RAD; }
  function bz(s, t) {
    var u = 1 - t;
    return [u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0],
      u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1]];
  }
  function dbz(s, t) {
    var u = 1 - t, a = sub(s[1], s[0]), b = sub(s[2], s[1]), c = sub(s[3], s[2]);
    return [3 * (u * u * a[0] + 2 * u * t * b[0] + t * t * c[0]), 3 * (u * u * a[1] + 2 * u * t * b[1] + t * t * c[1])];
  }
  // a point / tangent at u (in segments) along a chain
  function at(segs, u) { var i = Math.min(segs.length - 1, Math.max(0, Math.floor(u))); return bz(segs[i], u - i); }
  function tanAt(segs, u) { var i = Math.min(segs.length - 1, Math.max(0, Math.floor(u))); return unit(dbz(segs[i], Math.min(1, u - i))); }
  // u moved `d` units along the chain (d < 0: back)
  function walk(segs, u, d) {
    var step = d > 0 ? 0.002 : -0.002, p = at(segs, u), go = 0;
    while (go < Math.abs(d)) { var u2 = Math.max(0, Math.min(segs.length, u + step)); if (u2 === u) break; var q = at(segs, u2); go += len(sub(q, p)); p = q; u = u2; }
    return u;
  }
  // where two chains cross: the first crossing as { ua, ub } (u in segments along each), only where `ok(point)`
  function cross(A, B, ok) {
    var N = 120, pa = [], pb = [];
    A.forEach(function (s, i) { for (var j = 0; j <= N; j++) pa.push([bz(s, j / N), i + j / N]); });
    B.forEach(function (s, i) { for (var j = 0; j <= N; j++) pb.push([bz(s, j / N), i + j / N]); });
    for (var i = 0; i + 1 < pa.length; i++) {
      var p = pa[i][0], p2 = pa[i + 1][0];
      if (ok && !ok(p)) continue;
      for (var k = 0; k + 1 < pb.length; k++) {
        var q = pb[k][0], q2 = pb[k + 1][0], r = sub(p2, p), s = sub(q2, q), den = r[0] * s[1] - r[1] * s[0];
        if (Math.abs(den) < 1e-12) continue;
        var t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / den, w = ((q[0] - p[0]) * r[1] - (q[1] - p[1]) * r[0]) / den;
        if (t >= 0 && t <= 1 && w >= 0 && w <= 1) return { ua: pa[i][1] + (pa[i + 1][1] - pa[i][1]) * t, ub: pb[k][1] + (pb[k + 1][1] - pb[k][1]) * w, p: add(p, r, t) };
      }
    }
    return null;
  }
  function cOf(segs) { return kit.d(segs).replace(/^M[^C]*/, ''); }
  function copy(st) { var c = {}; for (var k in st) c[k] = st[k]; return c; }
  function withD(st, d) { var c = copy(st); c.d = d; return c; }
  function keepAt(out, list) { out.at = list.at; return out; }
  // the sit's long pen stroke (tail, back, head, chest) is the longest line of its list
  function mainLine(list) {
    var best = -1, n = 0;
    list.forEach(function (s, i) { if (s.t === 'line' && s.d.length > n) { n = s.d.length; best = i; } });
    return best;
  }
  function pol(c, r, deg) { return [c[0] + r * Math.cos(deg * RAD), c[1] + r * Math.sin(deg * RAD)]; }
  // an arc of a circle as cubics (each 90 degrees or less), from a0 to a1 (degrees, screen: + is clockwise), without
  // its start point (to append after a point already at pol(c, r, a0))
  function arcC(c, r, a0, a1) {
    var n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90)), da = (a1 - a0) / n, k = 4 / 3 * Math.tan(da / 4 * RAD) * r, out = '';
    for (var i = 0; i < n; i++) {
      var s = a0 + da * i, e = s + da, p0 = pol(c, r, s), p1 = pol(c, r, e);
      out += 'C' + P([p0[0] - Math.sin(s * RAD) * k, p0[1] + Math.cos(s * RAD) * k]) + ' ' + P([p1[0] + Math.sin(e * RAD) * k, p1[1] - Math.cos(e * RAD) * k]) + ' ' + P(p1);
    }
    return out;
  }
  function arcD(c, r, a0, a1) { return 'M' + P(pol(c, r, a0)) + arcC(c, r, a0, a1); }
  // a rounded rectangle centred on (0, 0), half sizes w and h, corner radius r (handles 0.552 r), starting in the
  // middle of the top edge and closing along it (the Z is the real left half of the top edge: no seam on a curve).
  // r = h gives a pill: each end ONE half round (two quarter cubics meeting on the end's axis), no flat bit to boil
  function rrect(w, h, r) {
    var k = r * 0.552;
    var side = function (x, y0, y1) { return Math.abs(y1 - y0) > 0.01 ? 'L' + P([x, y1]) : ''; };
    return 'M' + P([0, -h]) + 'L' + P([w - r, -h]) + 'C' + P([w - r + k, -h]) + ' ' + P([w, -h + r - k]) + ' ' + P([w, -h + r]) +
      side(w, -h + r, h - r) + 'C' + P([w, h - r + k]) + ' ' + P([w - r + k, h]) + ' ' + P([w - r, h]) +
      'L' + P([-w + r, h]) + 'C' + P([-w + r - k, h]) + ' ' + P([-w, h - r + k]) + ' ' + P([-w, h - r]) +
      side(-w, h - r, -h + r) + 'C' + P([-w, -h + r - k]) + ' ' + P([-w + r - k, -h]) + ' ' + P([-w + r, -h]) + 'Z';
  }

  // ---------------------------------------------------------------------------------------------- the face
  // head units (x right, y down, before tilt and scale) to canvas, for the head the sit placed
  function headFrame(at, tilt) {
    var s = at.headS, c = Math.cos(tilt * RAD), sn = Math.sin(tilt * RAD), X = at.head[0], Y = at.head[1];
    function v(p) { var x = p[0] * s, y = p[1] * s; return [x * c - y * sn, x * sn + y * c]; }
    return { v: v, toC: function (p) { var q = v(p); return [X + q[0], Y + q[1]]; } };
  }
  // the two eyes moved by `near` and `far` (head units): past the 'look' clamp, the far dot kept off the cheek. The
  // eyes are the head's dots, or its closed lids (lines of weight 0.9) on a blink frame, near one first
  function eyesBy(list, tilt, near, far) {
    var F = headFrame(list.at, tilt), k = 0;
    var out = list.map(function (st) {
      if (st.t !== 'dot' && !(st.t === 'line' && st.w === 0.9)) return st;
      var v = F.v(k++ ? far : near), c = copy(st);
      if (st.t === 'dot') { c.x += v[0]; c.y += v[1]; } else c.d = I.K.xf(st.d, { x: v[0], y: v[1] });
      return c;
    });
    return keepAt(out, list);
  }
  // happy eyes (^ ^) as calm low arcs, `wd` wide and rising `rise` (canvas units), like the model's closed lids turned
  // over: the head part's arcs (weight 0.9) are replaced where they sit
  function calmHappy(list, tilt, wd, rise) {
    var F = headFrame(list.at, tilt), s = list.at.headS, hw = wd / 2 / s, k = rise / 0.75 / s, eyes = [[1.9, 0.8], [16.9, -0.8]], n = 0;
    var out = list.map(function (st) {
      if (!(st.t === 'line' && st.w === 0.9)) return st;
      var e = eyes[Math.min(1, n++)], x = e[0], y = e[1] + 0.55;
      return withD(st, 'M' + P(F.toC([x - hw, y])) + 'C' + P(F.toC([x - hw * 0.45, y - k])) + ' ' + P(F.toC([x + hw * 0.45, y - k])) + ' ' + P(F.toC([x + hw, y])));
    });
    return keepAt(out, list);
  }

  // ---------------------------------------------------------------------------------------------- the neck
  /* The neck under a bowed head as ONE cubic from the shoulder to the nape, along the sit's own two tangents (the
     back's sweep at the shoulder, the skull's line at the nape), with handles hs at the shoulder and hn at the nape.
     At tilt 12, 20 and 20 give the lift's bend profile; the curve stays one segment, so the boil cannot step it. */
  function nearPt(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.05; }
  function neck1(list, hs, hn) {
    var i = mainLine(list), segs = kit.segs(list[i].d), nape = list.at.nape, k = -1;
    for (var j = 0; j < segs.length; j++) if (nearPt(segs[j][3], nape)) { k = j; break; }
    if (k < 0) return list;
    var s = segs[k], sh = s[0], tS = unit(sub(s[1], sh)), tN = unit(sub(s[3], s[2]));
    var neck = [sh, add(sh, tS, hs), add(nape, tN, -hn), nape];
    segs.splice(k, 1, neck);
    var out = list.slice();
    out[i] = withD(list[i], kit.d(segs));
    var ws = kit.segs(list[0].d.replace(/Z$/, ''));
    if (nearPt(ws[0][0], nape)) { ws.splice(0, 1, kit.rev([neck])[0]); out[0] = withD(list[0], kit.d(ws, true)); }
    return keepAt(out, list);
  }

  // ---------------------------------------------------------------------------------------------- paws
  // a raised paw's toe hooks (the paw part's own hooks, 1 unit inside the U); tip = the U's round end, deg = the leg's
  // heading toward the tip; n = 1 or 2 hooks
  function toeTicks(K, tip, deg, w, n) {
    var h = w / 2, a = deg * RAD, u = [Math.cos(a), Math.sin(a)], nn = [-u[1], u[0]], out = [];
    (n === 1 ? [0.12] : [-0.3, 0.3]).forEach(function (f) {
      var x = f * h, y0 = -(h - Math.sqrt(h * h - x * x)) * 0.92 - 1, L = 0.42;
      var q = [[x, y0], [x + 0.1, y0 - h * L * 0.4], [x - 0.1, y0 - h * L * 0.74], [x - 0.3, y0 - h * L]].map(function (p) {
        return [tip[0] + nn[0] * p[0] + u[0] * p[1], tip[1] + nn[1] * p[0] + u[1] * p[1]];
      });
      out.push(K.line('M' + P(q[0]) + 'C' + P(q[1]) + ' ' + P(q[2]) + ' ' + P(q[3]), { w: 0.8, boil: 0.45 }));
    });
    return out;
  }

  // ---------------------------------------------------------------------------------------------- bell
  /* A small alarm clock in the pen, kept lighter than the cat: a round body (R 22.5) on two short curved legs with a
     small round foot each, two small rose bells on short stems at 10 and 2 o'clock, no knob, no hour marks, and the
     hands at 8 o'clock as ONE stroke (the hour tip, the centre, the minute tip: the centre is a corner of one line, it
     cannot fork). The rim is a circle closed by its Z on the far side from the cat. Whites and order: the legs and
     stems first (the body's white hides their inner ends), the bells (their rose over the stems' outer ends), the
     body's white, the rim, the hands. It stands partly behind the cat's tail tip, so cat and clock are one group. */
  var CL = { c: [146, 166.4], R: 22.5, ground: 192.4, foot: 13.6, legA: 30, seam: 178, BA: [-128, -52], bw: 4, bh: 4.8, boff: 2.4 };
  function clock(K, ang) {
    var c = CL.c, R = CL.R, G = CL.ground, out = [], B = 0.6;
    // it rocks on one foot, then the other: tipping right (ang > 0) about the right foot, left about the left foot
    var piv = [c[0] + (ang > 0 ? 1 : -1) * CL.foot, G];
    var X = function (d) { return kit.warp(d, function (p) { return rot(p, piv, ang); }); };
    // the legs: from inside the body, a short slight curve down and out that turns outward at the ground into a small
    // round foot (the pen's round end), so they stand like feet and not like sticks
    [-1, 1].forEach(function (sd) {
      var a = pol(c, R - 2.5, 90 - sd * CL.legA), b = [c[0] + sd * CL.foot, G - 0.9], e = [b[0] + sd * 2.6, G - 0.6];
      out.push(K.line(X('M' + P(a) + 'C' + P(add(a, vec(90 - sd * 18, 3.4))) + ' ' + P(add(b, vec(90 + sd * 35, -2.2))) + ' ' + P(b) +
        'C' + P(add(b, vec(sd > 0 ? 18 : 162, 1.1))) + ' ' + P(add(e, [-sd * 1, 0])) + ' ' + P(e)), { boil: B }));
    });
    // the stems: from inside the body out to the bells
    var BR = R + CL.boff;
    CL.BA.forEach(function (ad) { out.push(K.line(X('M' + P(pol(c, R - 2, ad)) + 'L' + P(pol(c, BR + 0.5, ad))), { boil: B })); });
    // the bells: small rose domes, their flat lip toward the body, the outline starting in the middle of the lip
    CL.BA.forEach(function (ad) {
      var bc = pol(c, BR, ad), u = vec(ad), n = [-u[1], u[0]], bw = CL.bw, bh = CL.bh;
      function q(x, y) { return P([bc[0] + n[0] * x + u[0] * y, bc[1] + n[1] * x + u[1] * y]); }
      var d = 'M' + q(0, 0) + 'L' + q(bw, 0) + 'C' + q(bw, bh * 0.6) + ' ' + q(bw * 0.56, bh) + ' ' + q(0, bh) +
        'C' + q(-bw * 0.56, bh) + ' ' + q(-bw, bh * 0.6) + ' ' + q(-bw, 0) + 'Z';
      out.push(K.shape(X(d), 'r', { boil: 0.45 }));
    });
    var body = X(arcD(c, R, CL.seam, CL.seam + 360) + 'Z');
    out.push(kit.fill(body), K.line(body, { boil: B }));
    out.push(K.line(X('M' + P(pol(c, R - 12, 150)) + 'L' + P(c) + 'L' + P(pol(c, R - 8, -90))), { boil: 0.5 }));
    return { list: out, X: X };
  }
  // the ring ticks: a short arc out past each bell, carried by the clock's own turn; the one on the side it tips toward
  // flicks out further
  function ringTicks(K, X, ang) {
    var c = CL.c, R = CL.R, out = [];
    CL.BA.forEach(function (ad, i) {
      var side = i ? 1 : -1, far = (ang > 0 ? 1 : -1) === side ? 1.6 : 0, bc = pol(c, R + 3.4, ad);
      out.push(K.line(X(arcD(bc, 8 + far, ad - 19, ad + 19)), { boil: 0.5 }));
    });
    return out;
  }
  /* Sitting beside the clock, the head bowed toward it (tilt 12, set 3 forward and 4 down, neck1), the eyes at the
     bottom of the look range and one head unit past it, down and toward the clock; the ears up, the near one turned
     toward the clock. Motion: the clock rings in a burst and rests: it rocks 3, -3, 2, -2 degrees (on one foot, then
     the other) with a ring tick past each bell, then stands still two frames; the near ear flicks back with each
     jolt of the ring (8 degrees on the strong strikes, 4 on the weak) and settles when it stops. */
  var BELL = { x: 80, tilt: 12, hdx: 3, hdy: 4, ang: [3, -3, 2, -2, 0, 0], ears: [-5, -10], flick: [8, 4, 8, 4, 0, 0],
    look: [0.6, 1.6], eyeN: [0.7, 1], eyeF: [0.1, 1] };
  I.define('bell', { w: 220, h: 200, draw: function (t, K) {
    var f = Math.round(t * 6) % 6, ang = BELL.ang[f];
    var cat = K.part('sit', { x: BELL.x, y: 182, headDx: BELL.hdx, headDy: BELL.hdy,
      head: { eyes: 'look', dx: BELL.look[0], dy: BELL.look[1], tilt: BELL.tilt, ears: [BELL.ears[0] + BELL.flick[f], BELL.ears[1]] } });
    cat = eyesBy(neck1(cat, 20, 20), BELL.tilt, BELL.eyeN, BELL.eyeF);
    var cl = clock(K, ang);
    return cl.list.concat(ang ? ringTicks(K, cl.X, ang) : [], cat);
  } });

  // ---------------------------------------------------------------------------------------------- gift
  /* The near hind foot, lying forward on the ground under the belly, toes to the right: the family's foot (the same
     nodes as cheer, read and write). ONE stroke runs down the thigh's front (the model's haunch crease, its first two
     nodes), round the heel, along the sole to the round toe (a U), back along the top of the foot and stops open inside
     the body; no toe tick (MODEL 3: a foot near the tail's line). The sole tips down 13 degrees toward the toe, so only
     the round toe comes near the tail's top line. The chest runs on (the same pen stroke) as the belly, one even arc
     down onto the top of the foot: a T, its end under the foot's white, drawn after it. The body's white is rebuilt
     along the belly, so no white lies past a line. Returns { list: the cat, foot: the foot's strokes, drawn after it }. */
  var HF = { th: 13, h: 4.6, S: [115.6, 179.6], end: [103, 167.4] };
  function hindFoot(K, list, cutY) {
    var th = HF.th, h = HF.h, a = vec(th), n = leftOf(a), k = 0.552 * h, S = HF.S;
    var Cu = add(S, n, h), T = add(Cu, a, h), Tp = add(S, n, 2 * h);
    var nodes = [[75.5, 119, 27, 0, 13], [94.8, 146.5, 77, 9.5, 9], [95.8, 168.6, 98, 8, 2.8], [100, 174.9, th + 1, 2.8, 6],
      [S[0], S[1], th, 6, k], [T[0], T[1], th - 90, k, k], [Tp[0], Tp[1], th + 180, k, 6], [HF.end[0], HF.end[1], th + 182, 6, 0]];
    var fs = kit.chain(nodes), topSeg = fs[6];
    var foot = [kit.fill(kit.d(fs.slice(2)) + 'Z'), K.line(kit.d(fs))];
    var i = mainLine(list), segs = kit.segs(list[i].d);
    // the chest stops at cutY (behind the box), so the belly's arc takes over where the box hides the join
    if (cutY) { var ls = segs[segs.length - 1], uc = 1; for (var q = 0; q <= 1; q += 0.002) if (bz(ls, q)[1] >= cutY) { uc = q; break; } segs = segs.slice(0, -1).concat(kit.cut([ls], 0, uc)); }
    var last = segs[segs.length - 1], E = last[3], e0 = unit(dbz(last, 1));
    var B = bz(topSeg, 0.14), nB = leftOf(unit(dbz(topSeg, 0.14))), end = add(B, nB, 0.4);
    var h0 = hdg(e0), ch = hdg(sub(end, E)), bh = len(sub(end, E)) * 0.36;
    var belly = kit.chain([[E[0], E[1], h0, 0, bh], [end[0], end[1], 2 * ch - h0, bh, 0]]);
    var out = [];
    list.forEach(function (st, j) {
      if (st.t === 'line' && /^M75\.5 /.test(st.d)) return;           // the sit's haunch crease: the foot stroke redraws it
      out.push(j === i ? withD(st, kit.d(segs.concat(belly))) : st);
    });
    var ws = kit.segs(list[0].d.replace(/Z$/, '')), path = kit.d(ws.slice(0, 3)), low = [Cu[0], Cu[1] + h - 0.3];
    ws.slice(3).forEach(function (s) { var p = s[3]; if (p[0] < low[0] - 0.3 && p[1] > 175) path += 'L' + P(p); });
    path += 'L' + P([low[0], 182.1]) + 'L' + P(low) + 'L' + P(Cu) + 'L' + P(end);
    path += cOf(kit.rev(belly)) + cOf(kit.rev(segs.slice(segs.length - 2))) + 'L' + P([112, 72]) + 'Z';
    out[0] = withD(list[0], path);
    return { list: keepAt(out, list), foot: foot, belly: belly };
  }
  /* A wrapped box: white in the pen, a lid a little wider over its top, a rose ribbon down its middle (a flat band, no
     outline) and a rose bow of two small loops on the lid. Local units, the box's centre at (0, 0), then turned and
     moved (o.x, o.y, o.r); o.k scales the ribbon and the bow with the box. The body is an open U (its sides start 1.5
     units up under the lid, whose white hides their ends: no top corners to peek out); its bottom corners are r 3.4.
     The lid is a pill: each end ONE half round of radius lh (no short flat bit between two small corners to boil into
     a bump). The ribbon's band runs to the lid's lines' centres and 0.3 past (under the box's own rose band below, and
     into the bow's knot above), so no paper shows between rose and line. The bow's loops start inside the lid (their
     joint under its white). Everything boils at 0.6, so the rounds stay round. */
  function giftBox(K, o) {
    var w = o.w, h = o.h, lh = o.lh, ov = o.ov, rb = o.rb, sc = o.k || 1, r = 3.4, k = r * 0.552, B = 0.6, out = [];
    var X = function (d) { return K.xf(d, { x: o.x, y: o.y, r: o.r || 0 }); };
    var ly = -h + 1.5 - lh, top = ly - lh;
    var body = 'M' + P([-w, -h]) + 'L' + P([-w, h - r]) + 'C' + P([-w, h - r + k]) + ' ' + P([-w + r - k, h]) + ' ' + P([-w + r, h]) +
      'L' + P([w - r, h]) + 'C' + P([w - r + k, h]) + ' ' + P([w, h - r + k]) + ' ' + P([w, h - r]) + 'L' + P([w, -h]);
    var lid = K.xf(rrect(w + ov, lh, lh), { y: ly });
    function band(y0, y1) { return 'M' + P([-rb, y0]) + 'L' + P([rb, y0]) + 'L' + P([rb, y1]) + 'L' + P([-rb, y1]) + 'Z'; }
    var bow = [-1, 1].map(function (sd) {
      var y = top + 0.9;
      return 'M' + P([sd * 0.6, y]) + 'C' + P([sd * 1.8 * sc, top - 6.2 * sc]) + ' ' + P([sd * 9.4 * sc, top - 7.6 * sc]) + ' ' + P([sd * 9 * sc, top - 2.4 * sc]) +
        'C' + P([sd * 8.8 * sc, top + 0.3]) + ' ' + P([sd * 4.5 * sc, y]) + ' ' + P([sd * 2.2 * sc, y]) + 'Z';
    });
    out.push(K.shape(X(bow[0]), 'r', { boil: B }), K.shape(X(bow[1]), 'r', { boil: B }));
    out.push(kit.fill(X(body + 'Z')), kit.fill(X(band(-h, h)), 'r'), K.line(X(body), { boil: B }));
    out.push(kit.fill(X(lid)), kit.fill(X(band(top - 0.3, ly + lh + 0.3)), 'r'), K.line(X(lid), { boil: B }));
    return out;
  }
  /* A forearm: an even band from its root to its paw (the tail part's band), its white, its two lines and n toe hooks
     (0, 1 or 2). Its root sits inside the body's white (open there, like every leg). Returns the strokes with .band. */
  function foreArm(K, root, paw, bend, toes, w) {
    w = w || 11;
    var d = sub(paw, root), hd = hdg(d), L = len(d), c = add(paw, unit(d), -w / 2);
    var tb = kit.tube(kit.chain([[root[0], root[1], hd + bend, 0, L * 0.4], [c[0], c[1], hd - bend, L * 0.4, 0]]), w);
    var list = [kit.fill(kit.d(tb.a) + cOf(tb.cap) + cOf(kit.rev(tb.b)) + 'Z'),
      K.line(kit.d(tb.a.concat(tb.cap, kit.rev(tb.b))))];
    if (toes) list = list.concat(toeTicks(K, paw, hdg(unit(dbz(tb.center[tb.center.length - 1], 1))), w, toes));
    list.band = tb;
    return list;
  }
  /* Sitting, holding the box up in front of the chest in both front paws. The near forearm comes down from the
     shoulder (its root inside the body, open there like every leg) across the box's lower left front, its paw on the
     face, no toe tick; 6 units of the box's side and its round corner always show clear below it. The far forearm is BEHIND the box: drawn before it, only its paw shows, round the
     box's right side, as if hugging it; it rides with the box (the same turn and hop), so the side line always crosses
     the paw. Below the box the chest runs on as the belly, one arc onto the near hind foot, well clear of the near
     forearm. Happy eyes as calm low arcs, a smile, the head turned down 2 degrees (the model's nape, a 2-unit dip).
     Motion: the box gives a little hop in the paws (up 4 units over four frames, wiggling 3 degrees in the air, then two
     frames at rest); both paws ride with it exactly (the near forearm turns a little about its root), so the box never
     slides in them and the gap under the near paw holds. */
  var GIFT = { tilt: 2, box: { x: 151.5, y: 118, w: 24, h: 17.5, lh: 4.6, ov: 2.4, rb: 3, k: 1.15 },
    near: { root: [114, 111], paw: [140.5, 123.5], bend: 3 }, far: { root: [159, 126], paw: [185.5, 113.5], bend: 0 }, bellyY: 128,
    // a small white under every line where the head's white and the body's white meet nearly tangent (under the jaw,
    // behind the nape), so the two boiled edges never leave a pinhole there on a dark screen; well inside the outline
    patch: 'M88 68.5L101 68.5L101 80L88 80Z' };
  I.define('gift', { w: 200, h: 200, draw: function (t, K) {
    var f = Math.round(t * 6) % 6, hop = f < 4 ? 4 * Math.sin(Math.PI * f / 4) : 0, tw = [0, 3, 0, -3, 0, 0][f];
    var cat = K.part('sit', { y: 182, near: false, far: false, head: { eyes: 'happy', mouth: 'smile', eyeR: 1.2, tilt: GIFT.tilt } });
    cat = calmHappy(cat, GIFT.tilt, 5, 1.25);
    var hf = hindFoot(K, cat, GIFT.bellyY), G = GIFT, bx = G.box;
    hf.list.splice(1, 0, kit.fill(G.patch));
    // the box's own motion: up `hop`, turned `tw` about its centre; both paws ride with it exactly
    var bm = function (p) { return add(rot(p, [bx.x, bx.y], tw), [0, -hop]); };
    var farA = foreArm(K, bm(G.far.root), bm(G.far.paw), G.far.bend, 2);
    var nearA = foreArm(K, G.near.root, bm(G.near.paw), G.near.bend, 0);
    return hf.list.concat(hf.foot, farA, giftBox(K, { x: bx.x, y: bx.y - hop, r: tw, w: bx.w, h: bx.h, lh: bx.lh, ov: bx.ov, rb: bx.rb, k: bx.k }), nearA);
  } });

  // ---------------------------------------------------------------------------------------------- calendar
  /* A calendar page standing on the ground beside the cat, a page and not a slab (38 x 46): white in the pen, corners
     r 3.5, a rose-soft band on top (its fill reaches the outline's centre line), two tiny closed ring loops standing
     on its top edge, and 3 x 2 days: the first row ticked in the pen (open checks, about 100 degrees between their arms,
     weight 0.8), the second row small dots (r 0.95, half the eye's). The page boils at 0.6. Local units, centre (0, 0). */
  var CA = { x: 165, y: 166.4, w: 19, h: 25, r: 3.5, band: 8.6, cols: 3, rows: 2, dx: 10.6, ticks: 3, rings: true };
  function calRows() { var top = -CA.h + CA.band, span = CA.h - top; return [top + span / 3, top + span * 2 / 3]; }
  function calendar(K) {
    var o = { x: CA.x, y: CA.y }, X = function (d) { return K.xf(d, o); }, w = CA.w, h = CA.h, r = CA.r, k = r * 0.552, out = [];
    var page = rrect(w, h, r), by = -h + CA.band;
    var bandD = 'M' + P([0, -h]) + 'L' + P([w - r, -h]) + 'C' + P([w - r + k, -h]) + ' ' + P([w, -h + r - k]) + ' ' + P([w, -h + r]) +
      'L' + P([w, by]) + 'L' + P([-w, by]) + 'L' + P([-w, -h + r]) + 'C' + P([-w, -h + r - k]) + ' ' + P([-w + r - k, -h]) + ' ' + P([-w + r, -h]) + 'Z';
    out.push(kit.fill(X(page)), kit.fill(X(bandD), 'rs'), K.line(X('M' + P([-w + 0.3, by]) + 'L' + P([w - 0.3, by])), { w: 0.8, boil: 0.5 }));
    var rows = calRows(), n = 0, x0 = -(CA.cols - 1) * CA.dx / 2;
    for (var row = 0; row < CA.rows; row++) for (var col = 0; col < CA.cols; col++) {
      var x = x0 + col * CA.dx, y = rows[row];
      if (n < CA.ticks) out.push(K.line(X('M' + P([x - 3, y - 0.2]) + 'L' + P([x - 0.9, y + 2.1]) + 'L' + P([x + 3.6, y - 3.3])), { w: 0.8, boil: 0.5 }));
      else out.push(K.dot(x + CA.x, y + CA.y, 0.95));
      n++;
    }
    out.push(K.line(X(page), { boil: 0.6 }));
    if (CA.rings) [-w * 0.5, w * 0.5].forEach(function (x) {
      // a tiny closed loop through the top edge: a slim oval, 2.4 wide, rising 2.6 above the edge
      var cy = -h - 0.5, rx = 1.2, ry = 2.1, kx = rx * 0.552, ky = ry * 0.552;
      out.push(K.line(X('M' + P([x, cy - ry]) + 'C' + P([x + kx, cy - ry]) + ' ' + P([x + rx, cy - ky]) + ' ' + P([x + rx, cy]) +
        'C' + P([x + rx, cy + ky]) + ' ' + P([x + kx, cy + ry]) + ' ' + P([x, cy + ry]) + 'C' + P([x - kx, cy + ry]) + ' ' + P([x - rx, cy + ky]) + ' ' + P([x - rx, cy]) +
        'C' + P([x - rx, cy - ky]) + ' ' + P([x - kx, cy - ry]) + ' ' + P([x, cy - ry]) + 'Z'), { w: 0.8, boil: 0.4 }));
    });
    return out;
  }
  // the page's points in canvas units
  function caPt(p) { return [CA.x + p[0], CA.y + p[1]]; }
  /* The raised near leg, pointing at the first ticked day: an even band from its root inside the chest to the paw on
     the page's face just under the band, beside the first tick, the wrist bent `wrist` degrees down onto the page.
     ONE pen stroke: the chest comes down, turns onto the leg's top edge through a round of `rc` units each side (one
     cubic with long handles), runs along it, round the paw, back along its underside into the armpit, where it turns
     (a corner of the same stroke, so it can never fork or cross) and runs on down the far leg to its paw. The leg's
     white goes under the stroke. Returns the cat's list with the leg in it. */
  function pointArm(K, cat, root, tip, w, wrist) {
    var d = unit(sub(tip, root)), hd = hdg(d), pc = add(tip, d, -w / 2), L = len(sub(pc, root));
    // the centre line: nearly straight from the root, then bending down at the wrist (its last third)
    var mid = add(root, sub(pc, root), 0.74);
    var nodes = [[root[0], root[1], hd - wrist * 0.25, 0, L * 0.26], [mid[0], mid[1], hd + wrist * 0.05, L * 0.24, L * 0.09], [pc[0], pc[1], hd + wrist * 0.9, L * 0.09, 0]];
    var tb = kit.tube(kit.chain(nodes), w), i = mainLine(cat), segs = kit.segs(cat[i].d);
    var chest = function (p) { return p[0] > 95 && p[1] > 98 && p[1] < 150; };
    var top = cross(segs, tb.a, chest), bot = cross(segs, tb.b, chest);
    if (!top || !bot) return cat;
    /* the chest from the chin runs on into the leg's top edge as two cubics solved offline for this arm (MODEL 5.6):
       from the chin (leaving it at the sit's 54 degrees) through a node M (J.m from where the sit's chest crossed the
       edge, its heading J.dh steeper than the edge's) to J.e units along the edge past that crossing. The bend is
       continuous at M and at the edge, the chest keeps its swell (within 0.3 inside and 2.5 outside the sit's own), and
       every handle is 9 or longer, so the boil cannot kink a joint. The sit's chest is cut only at the chin, a node. */
    var J = CAL.join, chin = cat.at.chin, kc = -1;
    for (var j = 0; j < segs.length; j++) if (nearPt(segs[j][0], chin)) { kc = j; break; }
    if (kc < 0) return cat;
    var u0 = kc, v0 = walk(tb.a, top.ub, J.e), p0 = chin, p3 = at(tb.a, v0);
    var t0 = unit(sub(segs[kc][1], chin)), t3 = tanAt(tb.a, v0), tm = vec(hdg(tanAt(tb.a, top.ub)) + J.dh), M = add(top.p, J.m);
    var corner = [[p0, add(p0, t0, J.h[0]), add(M, tm, -J.h[1]), M], [M, add(M, tm, J.h[2]), add(p3, t3, -J.h[3]), p3]];
    // the body's white is rebuilt along the new lines: its chest edge (the sit's, from the far leg's y 152 up to the
    // chin) now runs up the far leg to the armpit, straight across inside the leg (under the leg's white) to p3, and
    // back along the new chest to the chin, so no white lies past a line and none is missing under one
    var ws = kit.segs(cat[0].d.replace(/Z$/, '')), jc = -1;
    for (var q = 0; q < ws.length; q++) if (nearPt(ws[q][3], chin)) { jc = q; break; }
    var bodyW = cat[0];
    if (jc > 0) {
      var lo = ws[jc - 1], tb0 = 0, bd = 1e9;
      for (var tt = 0; tt <= 1; tt += 0.002) { var pq = bz(lo, tt), dq = len(sub(pq, bot.p)); if (dq < bd) { bd = dq; tb0 = tt; } }
      bodyW = withD(cat[0], kit.d(ws.slice(0, jc - 1).concat(kit.cut([lo], 0, tb0))) + 'L' + P(p3) + cOf(kit.rev(corner)) + cOf(ws.slice(jc + 1)) + 'Z');
    }
    var turn = Math.acos(Math.max(-1, Math.min(1, t0[0] * t3[0] + t0[1] * t3[1])));
    var lineD = kit.d(kit.cut(segs, 0, u0).concat(corner, kit.cut(tb.a, v0, tb.a.length), tb.cap,
      kit.rev(kit.cut(tb.b, bot.ub, tb.b.length)), kit.cut(segs, bot.ua, segs.length)));
    var armW = kit.fill(kit.d(tb.a) + cOf(tb.cap) + cOf(kit.rev(tb.b)) + 'Z');
    var out = [bodyW].concat(cat.slice(1, i), [armW, withD(cat[i], lineD)], cat.slice(i + 1));
    out = keepAt(out, cat);
    out.pawDir = hdg(unit(dbz(tb.center[tb.center.length - 1], 1)));
    out.turn = turn / RAD;
    return out;
  }
  /* Sitting beside the page, the near paw raised and pointing at the first ticked day, its tip on the page's face just
     under the band; the head bowed toward the page (tilt 12, set 3 forward and 4 down, neck1), the eyes at the bottom of
     the look range and one head unit past it, on the paw and the days; smiling.
     Motion: the paw taps: it rests on the page (frames 6, 1, 2), lifts away from it with an ease (half, full, a little
     less: 4.5 units up and back at the top, the wrist unbending as it rises) and lands again. */
  var CAL = { x: 80, tilt: 12, hdx: 3, hdy: 4, root: [101, 104], tip: [150, 158.5], wrist: 10, join: { e: 18, m: [-0.48, -12.52], dh: 24.61, h: [9.16, 11.97, 10, 18.7] },
    lift: [0, 0, 0.5, 1, 0.4, 0], up: 4.5, liftDir: [-0.35, -0.94], look: [0.6, 1.6], eyeN: [0.7, 1], eyeF: [0.1, 1] };
  I.define('calendar', { w: 220, h: 200, draw: function (t, K) {
    var f = Math.round(t * 6) % 6, l = CAL.lift[f], tip = add(CAL.tip, unit(CAL.liftDir), l * CAL.up);
    var cat = K.part('sit', { x: CAL.x, y: 182, near: false, headDx: CAL.hdx, headDy: CAL.hdy,
      head: { eyes: 'look', dx: CAL.look[0], dy: CAL.look[1], mouth: 'smile', tilt: CAL.tilt, ears: [-2, -8] } });
    cat = eyesBy(neck1(cat, 20, 20), CAL.tilt, CAL.eyeN, CAL.eyeF);
    var arm = pointArm(K, cat, CAL.root, tip, 11, CAL.wrist * (1 - 0.7 * l));
    return calendar(K).concat(arm, toeTicks(K, tip, arm.pawDir, 11, 2));
  } });
})();
