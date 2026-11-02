/* Health Class blog · new cat poses for the website, drawn with the app's own engine and parts (vendor/ink.js, the
   copy of www/js/ink.js). Same rules as the app: one even pen line, white body, 6 frames, one small motion per loop.
   Load after ink.js. To add a pose: I.define(name, { w, h, draw(t, K) }) with K.part('head' | 'paw' | 'tail' | 'sit').
   The app can adopt any of these by copying its define() block into www/js/ink.js. */
(function () {
  'use strict';
  var I = window.HCInk;
  if (!I || !I.kit) return;
  var kit = I.kit;

  /* peek: the cat behind a ledge (the curved bar, in rose), chin up, both front paws hanging over the edge.
     Motion: the head bobs 1.4 units, the near ear flicks on frame 3, a blink on frame 5, the tail tip sways behind. */
  I.define('peek', { w: 200, h: 132, draw: function (t, K) {
    var f = Math.round(t * 6) % 6;
    var bob = [0, 0.7, 1.4, 0.9, 0.2, -0.3][f];
    var out = [];
    out = out.concat(K.part('tail', { nodes: [[145, 113, -80, 0, 18], [154, 72, -58, 12, 10], [170, 60, 4, 8, 0]], w: 8, sway: K.wave(t, 7) }));
    out.push(K.line('M12 106C70 115 130 115 188 106', { w: 1.5, c: 'r', boil: 0.5 }));
    out = out.concat(K.part('paw', { x: 80, y: 120 + (f === 3 ? -1.5 : 0), w: 13, l1: 19, l2: 19 }));
    out = out.concat(K.part('paw', { x: 120, y: 120, w: 13, l1: 19, l2: 19 }));
    out = out.concat(K.part('head', { x: 100, y: 68 + bob, s: 1.55, facing: 'f', eyes: kit.blink(t) ? 'closed' : 'open', mouth: 'smile', ears: [f === 2 ? -12 : 0, f === 2 ? 4 : 0], chin: true, whiskers: true }));
    return out;
  } });

  /* reading: the head and paws over the ledge, eyes down on an open letter that rests on it.
     Motion: the eyes move along the line (left to right, then back), one blink. */
  I.define('reading', { w: 200, h: 132, draw: function (t, K) {
    var f = Math.round(t * 6) % 6;
    var dx = [-1.4, -0.6, 0.2, 1, 1.4, 0][f];
    var out = [];
    out.push(K.line('M12 106C70 115 130 115 188 106', { w: 1.5, c: 'r', boil: 0.5 }));
    out = out.concat(K.part('head', { x: 100, y: 62, s: 1.45, facing: 'f', eyes: kit.blink(t) ? 'closed' : 'look', dx: dx, dy: 1.6, mouth: 'small', chin: true }));
    // the letter: a page with 3 lines of writing, held by both paws
    out.push(K.shape('M64 84L136 84L134 118L66 118Z', 'w', { boil: 0.6 }));
    out.push(K.line('M73 94L127 94', { w: 0.8, c: 'p', boil: 0.4 }));
    out.push(K.line('M73 102L121 102', { w: 0.8, c: 'p', boil: 0.4 }));
    out.push(K.line('M73 110L110 110', { w: 0.8, c: 'r', boil: 0.4 }));
    out = out.concat(K.part('paw', { x: 66, y: 122, r: -18, w: 12.5, l1: 10, l2: 10 }));
    out = out.concat(K.part('paw', { x: 134, y: 122, r: 18, w: 12.5, l1: 10, l2: 10 }));
    return out;
  } });
})();
