(function () {
'use strict';
/* =====================================================================
   The sky and the flock.
   One fixed canvas behind the page. Every section names a scene and a
   mood; the scene decides what the hundred birds are doing, the mood
   decides the light. Interludes are scrubbed by scroll: their progress p
   runs 0→1 while the section passes the middle of the screen.
   ===================================================================== */
var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var cv = document.getElementById('sky');
var ctx = cv.getContext('2d'), sky = ctx;
var layer = document.createElement('canvas'), lctx = layer.getContext('2d');   // a picture whose section edge is on screen is drawn here first, so the edge can be soft
var W = 0, H = 0, DPR = 1, wide = false, small = false;
var N = 100;
var INK = [18, 26, 36], LIGHT = [238, 242, 247];

function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
var rnd = mulberry(20261002);
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function ease(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
function mixc(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function rgba(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a == null ? 1 : a) + ')'; }
function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
function lum(c) { return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); }

/* ---------- moods: three sky stops, a glow, how much night ----------
   Warm light means one thing: the moratorium, and the times people got it
   right (firstlight, clear, golden). Everything before the moratorium is
   cool; so are the parts that explain, count or argue. */
function mood(top, mid, bot, gx, gy, gc, ga, night) { return { s: [hex(top), hex(mid), hex(bot)], g: [gx, gy, hex(gc), ga], n: night }; }
var MOODS = {   // one plain paper ground for the whole page: the pictures carry the meaning, not the sky
  cool: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  day: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  slate: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  overcast: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  uncanny: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  firstlight: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  night: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  haze: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  clear: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0),
  golden: mood('#f3f1ec', '#f3f1ec', '#f3f1ec', 0.5, 0.5, '#ffffff', 0, 0)
};
function blendMood(A, B, t) {
  if (t <= 0) return A; if (t >= 1) return B;
  return { s: [mixc(A.s[0], B.s[0], t), mixc(A.s[1], B.s[1], t), mixc(A.s[2], B.s[2], t)],
    g: [lerp(A.g[0], B.g[0], t), lerp(A.g[1], B.g[1], t), mixc(A.g[2], B.g[2], t), lerp(A.g[3], B.g[3], t)], n: lerp(A.n, B.n, t) };
}
function skyAt(M, fy) { return fy < 0.55 ? mixc(M.s[0], M.s[1], fy / 0.55) : mixc(M.s[1], M.s[2], (fy - 0.55) / 0.45); }
function onDark(M, fy) { return lum(skyAt(M, fy)) < 0.2; }
var MOON = [214, 222, 234];
function inkAt(M, y) { var L = lum(skyAt(M, clamp(y / H, 0, 1))); return mixc(INK, MOON, smooth((0.2 - L) / 0.1)); }
var curM = null;

var stars = [];
for (var si = 0; si < 110; si++) stars.push({ x: rnd(), y: rnd() * 0.78, r: 0.45 + rnd() * 0.95, a: 0.25 + rnd() * 0.7, tw: rnd() * 6.28 });

function drawSky(M, now) {
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, rgba(M.s[0])); g.addColorStop(0.55, rgba(M.s[1])); g.addColorStop(1, rgba(M.s[2]));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (M.g[3] > 0.01) {
    var gx = M.g[0] * W, gy = M.g[1] * H, r = Math.max(W, H) * 0.62;
    var rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
    rg.addColorStop(0, rgba(M.g[2], M.g[3])); rg.addColorStop(0.35, rgba(M.g[2], M.g[3] * 0.4)); rg.addColorStop(1, rgba(M.g[2], 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  if (M.n > 0.02) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], tw = reduced ? 1 : 0.75 + 0.25 * Math.sin(now * 0.0011 + s.tw);
      ctx.fillStyle = 'rgba(232,238,250,' + (s.a * M.n * tw).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill();
    }
  }
}

/* ---------- birds ---------- */
var B = [];
for (var bi = 0; bi < N; bi++) {
  B.push({ i: bi, x: rnd() * 900, y: rnd() * 500, vx: rnd() * 2 - 1, vy: rnd() * 2 - 1,
    ph: rnd() * 6.28, fs: 0.85 + rnd() * 0.3, st: 'fly', tg: null, delay: 0, dir: rnd() < 0.5 ? -1 : 1,
    hop: 0, hidden: false, morph: 1, ang: 0, sc: 1, trail: [], rank: rnd() });
  B[bi].fs0 = B[bi].fs;
}
var entering = false;   // true while a new scene assigns targets: perched birds must not wait on a wire that is gone
function setTarget(b, tg, delay) {
  b.tg = tg; b.delay = delay || 0;
  if (b.st === 'perched') { b.pendingLift = true; if (entering) b.delay = Math.min(b.delay, 60 + rnd() * 260); }
  if (b.hidden && tg && tg.kind !== 'away' && tg.kind !== 'hide') respawn(b, tg);
}
/* arrivals come in as one loose stream from the right edge (the margin side), at the height they are going to;
   a scene can ask for 'left' (the way they left) or 'below' (out of the light low on the screen) */
function respawn(b, tg) {
  var q = tg.wire ? tg.wire.pt(tg.t) : tg.box ? { x: tg.box.x + tg.box.w / 2, y: tg.box.y + tg.box.h / 2 } : tg.pts ? tg.pts[0] : tg;
  var tx = q.x != null ? q.x : F.ax || W * 0.7, ty = q.y != null ? q.y : F.ay || H * 0.3;
  if (tg.from === 'below') { b.x = clamp(tx + (rnd() - 0.5) * 110, tg.minx || 0, W - 8); b.y = H + 40 + rnd() * 140; b.vx = (rnd() - 0.5) * 0.5; b.vy = -2.5; }
  else if (tg.from === 'left') { b.x = -30 - rnd() * 140; b.y = ty + (rnd() - 0.5) * (tg.jit != null ? tg.jit : 50); b.vx = 2.6; b.vy = 0; }
  else { b.x = W + 30 + rnd() * 140; b.y = ty + (rnd() - 0.5) * (tg.jit != null ? tg.jit : 50); b.vx = -2.6; b.vy = 0; }
  b.hidden = false; b.st = 'fly'; b.trail.length = 0;
}

/* ---------- glyphs: drawn, not imported; three simple shapes ---------- */
function drawFlyer(x, y, ang, ph, s, col) {
  var f = Math.sin(ph);                 // wingbeat
  var span = 6.2 * s, up = (0.15 + 0.85 * (0.5 + 0.5 * f)) * 3.6 * s - 1.2 * s;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col;
  for (var sg = -1; sg <= 1; sg += 2) {
    ctx.beginPath();
    ctx.moveTo(0.9 * s * sg, -0.2 * s);
    ctx.quadraticCurveTo(span * 0.45 * sg, -up * 1.15 - 0.6 * s, span * sg, -up);
    ctx.quadraticCurveTo(span * 0.5 * sg, -up * 0.35 + 0.35 * s, 0.6 * s * sg, 0.55 * s);
    ctx.closePath(); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(0, 0.15 * s, 1.15 * s, 0.85 * s, 0, 0, 6.283); ctx.fill();
  ctx.restore();
}
function drawPercher(x, y, dir, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1); ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(-0.1 * s, -2.55 * s, 2.55 * s, 1.75 * s, -0.28, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(1.95 * s, -4.45 * s, 1.18 * s, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2.9 * s, -4.6 * s); ctx.lineTo(4.05 * s, -4.3 * s); ctx.lineTo(2.9 * s, -3.95 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-1.9 * s, -2.0 * s); ctx.lineTo(-5.3 * s, -0.45 * s); ctx.lineTo(-4.6 * s, -1.25 * s); ctx.lineTo(-2.2 * s, -3.0 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawDot(x, y, s, col, a) { var g0 = ctx.globalAlpha; ctx.fillStyle = col; ctx.globalAlpha = g0 * a; ctx.beginPath(); ctx.arc(x, y, 1.5 * s, 0, 6.283); ctx.fill(); ctx.globalAlpha = g0; }

/* ---------- geometry helpers ---------- */
function Wire(x0, y0, x1, y1, sag) { this.x0 = x0; this.y0 = y0; this.x1 = x1; this.y1 = y1; this.sag = sag; }
Wire.prototype.pt = function (t) { var mx = (this.x0 + this.x1) / 2, my = (this.y0 + this.y1) / 2 + 2 * this.sag, u = 1 - t; return { x: u * u * this.x0 + 2 * u * t * mx + t * t * this.x1, y: u * u * this.y0 + 2 * u * t * my + t * t * this.y1 }; };
function strokeWire(w, col, a) { if (curM) col = inkAt(curM, (w.y0 + w.y1) / 2); ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 1.15; ctx.beginPath(); ctx.moveTo(w.x0, w.y0); ctx.quadraticCurveTo((w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2 + 2 * w.sag, w.x1, w.y1); ctx.stroke(); }
function perchOn(w, t, dir) { return { kind: 'perch', wire: w, t: t, dir: dir || 1 }; }
function rowsAt(R, yFrac, gapD, sag, inset) {
  var n = small ? 4 : 2, gap = small ? 27 : gapD, y = R.y + R.h * yFrac - (n - 1) * gap / 2, ws = [];
  inset = inset || 0;
  for (var k = 0; k < n; k++) ws.push(new Wire(R.x - 10 + inset, y + k * gap, R.x + R.w + 10 - inset, y + k * gap, sag));
  return ws;
}
function slotIn(ws, k, total) { total = total || N; var per = Math.ceil(total / ws.length), w = Math.min(ws.length - 1, Math.floor(k / per)), j = k - w * per; return { wire: ws[w], t: 0.04 + 0.92 * (j + 0.5) / per }; }
function perchSlot(ws, k, dir, total) { var sl = slotIn(ws, k, total); return perchOn(sl.wire, sl.t, dir); }
function knot(i, t, R, scale, n) {
  n = n || N;
  var u = (i / n) * Math.PI * 2 + t * 0.00004;
  function p(uu) {
    var rr = 1 + 0.42 * Math.cos(3 * uu), X = rr * Math.cos(2 * uu), Y = rr * Math.sin(2 * uu), Z = 0.42 * Math.sin(3 * uu);
    var a = t * 0.00009, ca = Math.cos(a), sa = Math.sin(a), X1 = X * ca + Z * sa, Z1 = -X * sa + Z * ca;
    var tl = 0.62, ct = Math.cos(tl), st = Math.sin(tl), Y1 = Y * ct - Z1 * st, Z2 = Y * st + Z1 * ct;
    var s = Math.min(R.w, R.h * 1.25) * 0.29 * (scale || 1);
    return { x: R.x + R.w / 2 + X1 * s, y: R.y + R.h / 2 + Y1 * s * 0.92, z: Z2 };
  }
  var a0 = p(u), a1 = p(u + 0.03);
  a0.ang = clamp(Math.atan2(a1.y - a0.y, a1.x - a0.x), -0.9, 0.9) * 0.6;
  return a0;
}

/* ---------- sections ---------- */
var secEls = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
var colRef = document.querySelector('.col');
function readSections() {
  var out = [];
  for (var i = 0; i < secEls.length; i++) {
    var el = secEls[i];
    var d = el.closest('details'); if (d && !d.open) continue;
    var r = el.getBoundingClientRect();
    if (r.height < 2) continue;
    out.push({ el: el, r: r, scene: el.getAttribute('data-scene'), mood: el.getAttribute('data-mood'), from: el.getAttribute('data-from'), light: el.getAttribute('data-light'),
      inter: el.classList.contains('interlude'), hero: el.classList.contains('hero'), cap: el.querySelector('.cap') });
  }
  return out;
}
function activeIndex(list) {
  var c = H * 0.5, best = -1;
  for (var i = 0; i < list.length; i++) if (list[i].r.top <= c && list[i].r.bottom > c) best = i;
  if (best < 0) { var bd = 1e9; for (var j = 0; j < list.length; j++) { var d = Math.min(Math.abs(list[j].r.top - c), Math.abs(list[j].r.bottom - c)); if (d < bd) { bd = d; best = j; } } }
  return best;
}
function endMood(s) { return MOODS[s.mood] || MOODS.day; }
function moodNow(list, ai) {
  var s = list[ai]; var M = endMood(s);
  if (s.inter) {   // mp counts from the section's top, padding included: the light changes as the picture rides in
    var A = s.from && MOODS[s.from] ? MOODS[s.from] : (ai > 0 ? curFromMood(list, ai - 1) : M);
    var lw = s.light ? s.light.split(' ').map(Number) : [0.1, 0.5];   // an interlude can settle its light before its picture moves
    return blendMood(A, M, smooth(((s.mp != null ? s.mp : s.p) - lw[0]) / Math.max(0.01, lw[1] - lw[0])));
  }
  // a reading section takes the light over from the one before it once its top is in the upper third of the
  // screen, after the last lines before it have gone under the bar: no jump at the handover
  var pv = list[ai - 1];
  if (pv && pv.mood !== s.mood && !pv.el.contains(s.el) && !s.el.contains(pv.el)) {
    var t = smooth((H * 0.35 - s.r.top) / (H * 0.35));
    if (t < 1) return blendMood(endMood(pv), M, t);
  }
  return M;
}
function curFromMood(list, k) { return endMood(list[k]); }

/* ---------- regions ---------- */
function colRight() { if (!colRef) return W * 0.55; var r = colRef.getBoundingClientRect(); return r.right; }
var barH = 58, VH = window.innerHeight;   // the fixed bar (nothing pins under it); the small viewport height
function capStuckRect(s) {
  var c = s.cap, h = c.offsetHeight, top = c.classList.contains('at-top');
  var y = c._top != null ? c._top : top ? Math.max(H * 0.09, barH + 12) : H * (small ? 0.6 : 0.62);
  return { top: y, bottom: y + h, isTop: top };
}
/* Captions pin low on the screen, but never past its bottom edge and never under the bar: a tall one (the call,
   with its button) pins higher. Measured against the small viewport, so a phone's toolbar coming and going does
   not move them. A picture interlude ('fig') gets top padding as tall as its picture, so the picture scrolls in
   above its caption, inside its own section, like a figure, and pins with it. */
var caps = Array.prototype.slice.call(document.querySelectorAll('.cap'));
var svp = document.createElement('div');
svp.setAttribute('aria-hidden', 'true');
svp.style.cssText = 'position:absolute;top:0;left:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';
document.body.appendChild(svp);
function picTop() { return Math.max(VH * 0.07, barH + 8); }
function fitCaps() {
  VH = svp.offsetHeight || window.innerHeight;
  var bar = document.getElementById('bar'); barH = bar ? bar.offsetHeight : 58;
  document.documentElement.style.setProperty('--barh', barH + 'px');
  var floor = Math.max(VH * 0.09, barH + 12), t0 = picTop();
  for (var i = 0; i < caps.length; i++) {
    var c = caps[i], h = c.offsetHeight, sec = c.parentNode, y;
    if (!h) { c._top = null; continue; }   // inside the closed technical section
    if (c.classList.contains('at-top')) { c._top = parseFloat(getComputedStyle(c).top) || floor; c._nopic = VH * 0.95 - (c._top + h + 30) < 120; if (sec.classList.contains('hold')) sec.style.setProperty('--hold', Math.round(c._top + h) + 'px'); continue; }
    y = Math.round(Math.max(floor, Math.min(VH * (window.innerWidth <= 700 ? 0.6 : 0.62), VH - h - Math.max(16, VH * 0.045))));
    if (c._top !== y) { c._top = y; c.style.setProperty('--captop', y + 'px'); }
    if (sec.classList.contains('fig')) {
      var above = y - t0 - 30, below = VH * 0.95 - (y + h + 24); c._below = above < 90 && below > above;   // too little room above: the picture goes under the caption
      c._nopic = Math.max(above, below) < 120;   // no room on either side for a legible picture (a very short screen): the caption stands alone
      var pad = c._below || c._nopic ? 0 : Math.max(0, Math.round(y - t0)); if (sec._pad !== pad) { sec._pad = pad; sec.style.setProperty('--pad', pad + 'px'); }
    }
  }
}
var heroEl = document.querySelector('.hero'), heroQ = document.querySelector('.hero-q'), heroT = document.querySelector('.hero-text');
function regionFor(s) {
  if (s.hero) {   // drawn on the first screen, so it moves with it
    var ht = heroEl.getBoundingClientRect().top, q = heroQ ? heroQ.getBoundingClientRect() : null;
    if (q && q.height) {   // desktop: the quotes take the bottom; the line sits in the sky beside the headline
      var x0 = Math.max(W * 0.5, heroT.getBoundingClientRect().right + 40), y0 = ht + H * 0.08;
      return { x: x0, y: y0, w: Math.max(220, W * 0.96 - x0), h: Math.max(150, q.top - y0 - 70) };
    }
    return { x: W * 0.04, y: ht + H * 0.07, w: W * 0.92, h: H * (small ? 0.42 : 0.5) };
  }
  if (s.inter && s.cap) {
    var c = capStuckRect(s), x = W * (small ? 0.05 : 0.06), w = W * (small ? 0.9 : 0.88);
    if (!c.isTop) {
      if (s.cap._below) { var yb = c.bottom + 24; return { x: x, y: yb, w: w, h: Math.max(40, VH * 0.95 - yb) }; }   // a very short screen: under the caption
      var y = picTop(); return { x: x, y: y, w: w, h: Math.max(40, c.top - y - 30) };
    }
    var y2 = c.bottom + 30; return { x: x, y: y2, w: w, h: Math.max(140, VH * 0.95 - y2) };   // the small viewport: a phone's toolbar does not move it
  }
  if (wide) { var x3 = colRight() + Math.max(56, W * 0.05); return { x: x3, y: H * 0.14, w: Math.max(200, W - x3 - Math.max(40, W * 0.04)), h: H * 0.72 }; }
  return null;
}

/* ---------- free flight ---------- */
var TUNE = window.__tune || { sep: 34, sepw: 0.55, coh: 0.0022, ali: 0.08, glob: 0.0005, rad: 90 };
var F = { R: { x: 0, y: 0, w: 1, h: 1 }, ax: 0, ay: 0, sc: 1, vmax: 3.2, vmin: 1.3, pull: 1, edge: 0.16, obs: [], gx: 0, gy: 0, gn: 0 };
function flockCentre() {
  var x = 0, y = 0, n = 0;
  for (var i = 0; i < N; i++) { var o = B[i]; if (o.hidden || o.st === 'perched' || !o.tg || o.tg.kind !== 'free') continue; x += o.x; y += o.y; n++; }
  F.gn = n; if (n) { F.gx = x / n; F.gy = y / n; }
}
function freeFly(b, dt) {
  var cx = 0, cy = 0, avx = 0, avy = 0, sx = 0, sy = 0, n = 0;
  for (var j = 0; j < N; j++) {
    if (j === b.i) continue; var o = B[j];
    if (o.hidden || o.st === 'perched' || !o.tg || o.tg.kind !== 'free') continue;
    var dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
    if (d2 > TUNE.rad * TUNE.rad) continue;
    n++; cx += o.x; cy += o.y; avx += o.vx; avy += o.vy;
    var sep = TUNE.sep * F.sc * (small ? 0.8 : 1);
    if (d2 < sep * sep) { var d = Math.sqrt(d2) + 0.01; sx -= dx / d * (sep - d) / sep; sy -= dy / d * (sep - d) / sep; }
  }
  var ax = 0, ay = 0;
  if (n) { ax += (cx / n - b.x) * TUNE.coh; ay += (cy / n - b.y) * TUNE.coh; ax += (avx / n - b.vx) * TUNE.ali; ay += (avy / n - b.vy) * TUNE.ali; }
  if (F.gn > 1) { ax += (F.gx - b.x) * TUNE.glob; ay += (F.gy - b.y) * TUNE.glob; }
  ax += sx * TUNE.sepw; ay += sy * TUNE.sepw;
  b.wd = (b.wd || b.rank * 6.28) + 0.02 * dt; ax += Math.cos(b.wd * 1.7 + b.i) * 0.03; ay += Math.sin(b.wd * 1.3 + b.i * 0.7) * 0.03;
  var tx = F.ax - b.x, ty = F.ay - b.y, td = Math.sqrt(tx * tx + ty * ty) + 0.01;
  ax += tx / td * 0.05 * F.pull * Math.min(1, td / 90); ay += ty / td * 0.05 * F.pull * Math.min(1, td / 90);
  var R = F.R, m = 26, ex = F.edge || 0.16;
  if (b.x < R.x + m) ax += ex; if (b.x > R.x + R.w - m) ax -= ex;
  if (b.y < R.y + m) ay += ex; if (b.y > R.y + R.h - m) ay -= ex;
  for (var k = 0; k < F.obs.length; k++) {
    var ob = F.obs[k];
    if (b.x > ob.x && b.x < ob.x + ob.w && b.y > ob.y && b.y < ob.y + ob.h) {
      var l = b.x - ob.x, r = ob.x + ob.w - b.x, t = b.y - ob.y, bt = ob.y + ob.h - b.y, mn = Math.min(l, r, t, bt);
      if (mn === l) ax -= 0.4; else if (mn === r) ax += 0.4; else if (mn === t) ay -= 0.4; else ay += 0.4;
    }
  }
  b.vx += ax * dt; b.vy += ay * dt;
  var v = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (v > F.vmax) { b.vx *= F.vmax / v; b.vy *= F.vmax / v; } else if (v < F.vmin && v > 0) { b.vx *= F.vmin / v; b.vy *= F.vmin / v; }
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.ang = clamp(Math.atan2(b.vy, Math.abs(b.vx) + 0.01), -0.5, 0.5) * 0.6;
  b.sc = F.sc;
}

/* ---------- targeted flight ---------- */
function targetXY(b) {
  var tg = b.tg;
  if (tg.wire) { var p = tg.wire.pt(tg.t); tg.x = p.x; tg.y = p.y; }
  return tg;
}
function seek(b, dt) {
  var tg = targetXY(b);
  var dx = tg.x - b.x, dy = tg.y - b.y, d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
  if (tg.kind === 'perch' && d < 2.2) { b.x = tg.x; b.y = tg.y; b.vx = b.vy = 0; b.st = 'perched'; b.dir = tg.dir || b.dir; b.ang = 0; return; }
  // long arrivals are brisk; the last stretch brakes
  var vmax = tg.v || (tg.fast ? 7.5 : 3.6 + 2.6 * smooth((d - 120) / 220)), want = Math.min(vmax, d * (tg.kind === 'hover' ? 0.05 : 0.085) + 0.5);
  var stx = dx / d * want - b.vx, sty = dy / d * want - b.vy, k = tg.fast ? 0.3 : 0.13;
  b.vx += stx * k * dt; b.vy += sty * k * dt;
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.ang = clamp(Math.atan2(b.vy, Math.abs(b.vx) + 0.01), -0.6, 0.6) * 0.55;
  if (b.vx > 0.25) b.dir = 1; else if (b.vx < -0.25) b.dir = -1;
  if (tg.kind === 'away' && (b.y < -40 || b.x < -50 || b.x > W + 50)) b.hidden = true;
}
function pin(b, dt) {
  var tg = b.tg, k = 1 - Math.pow(1 - (tg.k || 0.16), dt);
  var nx = b.x + (tg.x - b.x) * k, ny = b.y + (tg.y - b.y) * k;
  b.vx = (nx - b.x) / Math.max(dt, 0.01); b.vy = (ny - b.y) / Math.max(dt, 0.01); b.x = nx; b.y = ny;
  b.ang = tg.ang != null ? tg.ang : clamp(Math.atan2(b.vy, Math.abs(b.vx) + 0.01), -0.6, 0.6) * 0.5;
  b.st = 'fly';
}
function roam(b, dt) {
  var tg = b.tg, bx = tg.box;
  if (tg.wx == null || tg.left <= 0 || Math.abs(tg.wx - b.x) + Math.abs(tg.wy - b.y) < 10) {
    tg.wx = bx.x + 10 + rnd() * Math.max(1, bx.w - 20); tg.wy = bx.y + 10 + rnd() * Math.max(1, bx.h - 20); tg.left = 40 + rnd() * 70;
  }
  tg.left -= dt;
  var dx = tg.wx - b.x, dy = tg.wy - b.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01, sp = tg.speed || 2.1;
  b.vx += (dx / d * sp - b.vx) * 0.06 * dt; b.vy += (dy / d * sp - b.vy) * 0.06 * dt;
  b.x += b.vx * dt; b.y += b.vy * dt;
  if (b.x < bx.x + 4) { b.x = bx.x + 4; b.vx = Math.abs(b.vx); } if (b.x > bx.x + bx.w - 4) { b.x = bx.x + bx.w - 4; b.vx = -Math.abs(b.vx); }
  if (b.y < bx.y + 4) { b.y = bx.y + 4; b.vy = Math.abs(b.vy); } if (b.y > bx.y + bx.h - 4) { b.y = bx.y + bx.h - 4; b.vy = -Math.abs(b.vy); }
  b.ang = clamp(Math.atan2(b.vy, Math.abs(b.vx) + 0.01), -0.6, 0.6) * 0.5;
}
function followPath(b, dt) {
  var tg = b.tg, pt = tg.pts[tg.i];
  var dx = pt.x - b.x, dy = pt.y - b.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01, sp = Math.min(3.4, d * 0.09 + 1.4);
  b.vx += (dx / d * sp - b.vx) * 0.16 * dt; b.vy += (dy / d * sp - b.vy) * 0.16 * dt;
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.ang = clamp(Math.atan2(b.vy, Math.abs(b.vx) + 0.01), -0.6, 0.6) * 0.55;
  if (d < 9) { tg.i++; if (tg.i >= tg.pts.length) b.tg = tg.then; }
}
function stepBird(b, dt) {
  if (b.hidden) return;
  if (b.sc < 1 && b.tg && b.tg.kind !== 'free' && b.tg.kind !== 'away') b.sc = Math.min(1, b.sc + 0.015 * dt);   // back to full size after the scatter
  if (b.delay > 0) {
    b.delay -= dt * 16.67;
    if (b.st === 'perched') { if (b.pendingLift && b.tg && b.tg.wire && !entering) { /* still on its old wire */ } return; }
    if (b.tg && b.tg.kind !== 'free') { b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx * dt; b.y += b.vy * dt; b.ph += 0.3 * dt * b.fs; return; }
  }
  if (b.st === 'perched' && b.pendingLift) { b.pendingLift = false; b.st = 'fly'; b.vy = -1.6 - rnd(); b.vx = (rnd() - 0.5) * 1.6; }
  if (b.st === 'perched') {
    if (b.tg && b.tg.wire) { var p = b.tg.wire.pt(b.tg.t); b.x = p.x; b.y = p.y; }
    return;
  }
  var tg = b.tg;
  if (!tg || tg.kind === 'free') freeFly(b, dt);
  else if (tg.kind === 'pin') pin(b, dt);
  else if (tg.kind === 'roam') roam(b, dt);
  else if (tg.kind === 'path') followPath(b, dt);
  else seek(b, dt);
  b.ph += (tg && tg.kind === 'hover' ? 0.22 : 0.31) * dt * b.fs;
  if (tg && tg.fast) { b.trail.push(b.x, b.y); if (b.trail.length > 10) b.trail.splice(0, 2); } else if (b.trail.length) b.trail.length = 0;
  if (b.x !== b.x || b.y !== b.y) { b.x = W / 2; b.y = H / 3; b.vx = 1; b.vy = 0; }
}

/* =====================================================================
   Scenes. enter() runs once when a scene starts (or the layout changes),
   frame() runs every frame with the scroll progress p, back() draws the
   lines behind the birds, front() draws anything over them.
   ===================================================================== */
var SC = {}, G = {};   // G: per-scene geometry
var labelFont = '600 15px "Alegreya Sans", "Gill Sans", sans-serif';
function setAllFree(stagger) { for (var i = 0; i < N; i++) setTarget(B[i], { kind: 'free' }, stagger ? rnd() * stagger : 0); }
function lissajous(R, now, sx, sy) { return { x: R.x + R.w * (0.5 + 0.33 * Math.sin(now * 0.00017 * (sx || 1))), y: R.y + R.h * (0.48 + 0.26 * Math.sin(now * 0.00023 * (sy || 1) + 1.3)) }; }

/* the first screen: a line draws itself, the flock comes in and stops on it, and stays.
   "Stopped until scientists consider it safe"; the line comes back for the poll's stop, the nations,
   every agreement that held, your place, and first light. It scrolls away with the page, still perched. */
function anchorWires(old, ws) { if (!old || old.length !== ws.length) return ws; ws.forEach(function (w, k) { var o = old[k]; o.x0 = w.x0; o.y0 = w.y0; o.x1 = w.x1; o.y1 = w.y1; o.sag = w.sag; }); return old; }
SC.line = {
  wires: function (S) {   // two lines running in from the right edge, toward the headline
    var R = S.R, y = R.y + R.h * (small ? 0.46 : 0.5), x0 = small ? R.x + R.w * 0.04 : R.x;
    return [new Wire(x0, y - 17, W + 24, y - 21, 6), new Wire(x0 + (small ? 26 : 34), y + 17, W + 24, y + 13, 6)];
  },
  slots: function () {   // birds sit the way birds sit: uneven gaps, a few close pairs, nobody in the last stretch off-screen
    var out = [], per = small ? 27 : 36;
    for (var w = 0; w < 2; w++) {
      var n = 0;
      for (var j = 0; j < per + 6 && n < per; j++) {
        if (rnd() < 0.14) continue;
        var t = (j + 0.5 + (rnd() - 0.5) * 0.62) / (per + 6);
        out.push({ w: w, t: clamp(t, 0.015, 0.93) * (small ? 0.96 : 0.92) }); n++;
      }
    }
    return out;
  },
  lay: function (S) { G.line.ws = anchorWires(G.line.ws, this.wires(S)); },
  enter: function (S) {
    G.line = { ws: null, t0: S.placed ? -1e9 : performance.now() }; this.lay(S);
    var sl = this.slots();
    for (var i = 0; i < N; i++) {
      if (i >= sl.length) { B[i].hidden = true; B[i].tg = null; continue; }   // the first screen needs only part of the flock
      var tg = perchOn(G.line.ws[sl[i].w], sl[i].t, i % 5 ? -1 : 1); tg.v = 6.4;
      setTarget(B[i], tg, 420 + Math.pow(rnd(), 1.3) * 1100);
    }
  },
  frame: function (S) { this.lay(S); },
  back: function (S, col) {
    var d = smooth(clamp((performance.now() - G.line.t0) / 460, 0, 1));
    G.line.ws.forEach(function (w) {
      if (d >= 1) { strokeWire(w, col, 0.55); return; }
      var x = w.x1 - (w.x1 - w.x0) * d;   // drawn from the edge in
      ctx.save(); ctx.beginPath(); ctx.rect(x - 2, -9999, w.x1 - x + 6, 19998); ctx.clip(); strokeWire(w, col, 0.55); ctx.restore();
    });
  }
};
function lineHop(b, now) {   // now and then one bird shifts its feet; nothing else moves
  var k = Math.floor(now / 6800), who = (k * 37 + 11) % N, ph = now - k * 6800;
  return b.i === who && ph < 260 && b.st === 'perched' ? -4.5 * Math.sin(Math.PI * ph / 260) : 0;
}

/* grown, not designed: random numbers, nudged step by step, become a shape nobody drew */
SC.grown = {
  entry: 'fade',
  enter: function (S) { for (var i = 0; i < N; i++) { B[i].hidden = true; B[i].tg = null; } this.lay(S); },
  lay: function (S) {
    var R = S.R, rr = mulberry(20261023), segs = [], tips = [], seeds = small ? 3 : 5, max = small ? 420 : 900, L = small ? 5 : 6.5, i;
    for (i = 0; i < seeds; i++) tips.push({ x: R.x + R.w * (0.14 + 0.72 * (i + 0.5) / seeds) + (rr() - 0.5) * 30, y: R.y + R.h * 0.92, a: -Math.PI / 2 + (rr() - 0.5) * 0.5, d: 0 });
    var guard = 0;
    while (segs.length < max && tips.length && guard++ < 20000) {
      var k = Math.floor(rr() * tips.length), t = tips[k];
      t.a += (rr() - 0.5) * 0.7;
      var nx = t.x + Math.cos(t.a) * L, ny = t.y + Math.sin(t.a) * L;
      if (nx < R.x + 8 || nx > R.x + R.w - 8 || ny < R.y + 6 || ny > R.y + R.h * 0.95) { t.a += Math.PI * 0.6 * (rr() < 0.5 ? 1 : -1); if (rr() < 0.3) tips.splice(k, 1); continue; }
      segs.push([t.x, t.y, nx, ny, t.d]); t.x = nx; t.y = ny; t.d++;
      if (rr() < 0.075 && tips.length < 70) tips.push({ x: nx, y: ny, a: t.a + (rr() < 0.5 ? 0.7 : -0.7), d: t.d });
      if (t.d > 160) tips.splice(k, 1);
    }
    var dots = []; for (i = 0; i < (small ? 120 : 260); i++) dots.push([R.x + rr() * R.w, R.y + rr() * R.h * 0.95]);
    G.grown = { segs: segs, dots: dots, R: R };
  },
  frame: function (S, p) { if (S.relaid || !G.grown) this.lay(S); G.grown.u = reduced ? 1 : smooth((p - 0.04) / 0.42); },
  back: function (S, col) {
    var g = G.grown; if (!g) return;
    var n = Math.floor(g.segs.length * g.u), i;
    ctx.fillStyle = rgba(col, 0.35 * (1 - g.u));   // the numbers, before anything is learned
    ctx.beginPath(); for (i = 0; i < g.dots.length; i++) ctx.rect(g.dots[i][0], g.dots[i][1], 1.4, 1.4); ctx.fill();
    ctx.strokeStyle = rgba(col, 0.6); ctx.lineCap = 'round';
    for (var w = 0; w < 3; w++) {   // thicker where it is older
      ctx.lineWidth = [1.6, 1.1, 0.7][w]; ctx.beginPath();
      for (i = 0; i < n; i++) { var sg = g.segs[i], d = sg[4]; if ((d < 30 ? 0 : d < 80 ? 1 : 2) !== w) continue; ctx.moveTo(sg[0], sg[1]); ctx.lineTo(sg[2], sg[3]); }
      ctx.stroke();
    }
  }
};

/* "We become the irrelevant animal in the way", drawn as a surveyor's elevation (round 8; the round-7 toy town read as a children's book). */
SC.highway = {   // "We become the irrelevant animal in the way", drawn as a surveyor's elevation with nothing labelled. A town in open country; a level is set out across all the land, with stakes at one spacing through the town exactly as through the fields; then everything above the level is cleared and cut away at one steady pace, from one side to the other, until only flat ground and the stakes are left. Every mark is a function of p and a seeded layout, so scrolling back restores the town exactly.
  entry: 'fade',
  P: function () { return small ? { P0: 0.205, P1: 0.285, P2: 0.325, P3: 0.70 } : { P0: 0.185, P1: 0.275, P2: 0.31, P3: 0.715 }; },   // the level and its stakes go in from P0 to P1; the cut runs from P2 to P3; then it is held until the caption lets go
  enter: function (S) { for (var i = 0; i < N; i++) { B[i].hidden = true; B[i].tg = null; } this.lay(S); },
  lay: function (S) {
    var R = S.R, sm = small, rr = mulberry(20261010), i, k, x;
    var gy = R.y + R.h * clamp(0.64 - 0.11 * (R.h / Math.max(1, R.w) - 0.45), 0.52, 0.64);   // the level: everything above it goes (higher in a tall picture)
    var Zcap = Math.max(0.45, Math.min(sm ? 1.6 : 2.2, (gy - R.y - 8) / 96));   // the tower must fit under the caption
    // the front's run, and where it stands in the reduced-motion still: the town ends short of it there, the river starts past it
    var PP = this.P(), still = typeof STILL === 'object' && STILL && STILL.highway >= 0 ? STILL.highway : 0.46, lead = sm ? 64 : 120;
    var f0 = W + 22 + lead, f1 = -28 - 1.1 * Zcap * (sm ? 30 : 14), fS = f0 - (f0 - f1) * clamp((still - PP.P2) / (PP.P3 - PP.P2), 0, 1);
    var t0 = W * (sm ? -0.04 : 0.10), span = Math.max(W * 0.3, Math.min(W * 0.62, fS - 0.5 * lead - t0));   // the town's stretch of land
    // the town, west to east: [kind, width in units, priority, gap after]; narrower screens keep the essential blocks at a size you can see
    var seq = sm ? [['row4', 52, 1, 6], ['civic', 49, 1, 6], ['block1', 56, 1, 0]]
                 : [['housesW', 70, 4, 20], ['row6', 81, 1, 9], ['civic', 49, 1, 16], ['blocks2', 92, 2, 10], ['houses3', 86, 2, 20], ['works', 58, 4, 12], ['wt', 20, 2, 0]];
    var use = seq, tot = 0, pr, gaps = 0, zMin = sm ? 0.75 : W >= 1100 ? 1.85 : 1.35;
    for (pr = 4; pr >= 1; pr--) {
      use = seq.filter(function (c) { return c[2] <= pr; }); tot = 0;
      for (i = 0; i < use.length; i++) tot += use[i][1] + (i < use.length - 1 ? use[i][3] : 0);
      if (span / tot >= zMin || pr === 1) break;
    }
    var Z = Math.max(0.45, Math.min(Zcap, span / tot));
    for (i = 0; i < use.length - 1; i++) gaps += use[i][3];
    var stretch = gaps > 0 ? clamp(1 + (span - tot * Z) / (gaps * Z), 1, 1.7) : 1, used = (tot - gaps) * Z + gaps * Z * stretch;
    // the land: a broad hill, a gentle rise for the town, a river, a rise beyond it; surveyed ground is never quite smooth
    var rwF = sm ? 0.045 : 0.024, rcF = clamp((fS + 10) / W + rwF, sm ? 0.865 : 0.78, sm ? 0.9 : 0.86);   // the river's left bank lies just past the still's front
    var bumps = sm ? [[0.4, 6, 0.33], [rcF, -9, rwF], [0.985, 8, 0.06]]
                   : [[0.045, 26, 0.06], [0.42, 8, 0.3], [rcF, -10, rwF], [0.925, 9, 0.065]];
    var base = gy - (sm ? 11 : 14) * Z, q1 = rr() * 6.28, q2 = rr() * 6.28, q3 = rr() * 6.28;
    function natY(xx) {
      var y = base + Z * (0.8 * Math.sin(xx / 31 + q1) + 0.45 * Math.sin(xx / 13.7 + q2) + 0.2 * Math.sin(xx / 6.1 + q3));
      for (var j = 0; j < bumps.length; j++) { var b = bumps[j], d = Math.abs(xx / W - b[0]) / b[2]; if (d < 1) y -= b[1] * Z * 0.5 * (1 + Math.cos(Math.PI * d)); }
      return y;
    }
    // ---- drawing kit: an object is outlines (filled, then drawn), struts (drawn at outline weight), fine lines and openings; (u, v) are units from its left foot, v up
    var objs = [];
    function mk(x0, w, layer, plot, bY) {
      var x1 = x0 + w * Z, o = { x0: x0, x1: x1, base: bY != null ? bY : natY((x0 + x1) / 2), layer: layer, plot: plot !== false, parts: [], struts: [], lines: [], wins: [], edges: [x0, x1], top: 1e9, la: layer ? 0.5 : 0.74, da: layer ? 0.26 : 0.36, lw: layer ? 0.85 : 1 };
      objs.push(o); return o;
    }
    function at(o, u, v) { return [o.x0 + u * Z, o.base - v * Z]; }
    function poly(o, uv, into) { var a = []; for (var j = 0; j < uv.length; j++) { var q = at(o, uv[j][0], uv[j][1]); a.push(q); if (q[1] < o.top) o.top = q[1]; } into.push(a); return a; }
    function part(o, uv) { return poly(o, uv, o.parts); }
    function strut(o, uv) { return poly(o, uv, o.struts); }
    function line(o, uv) { return poly(o, uv, o.lines); }
    function win(o, u, v, w, hh) { var q = at(o, u, v + hh); o.wins.push([q[0], q[1], w * Z, hh * Z]); }
    function gable(x0, w, wall, rise, layer, chim, bY) {   // a house with its gable end to us
      var o = mk(x0, w, layer, true, bY), ov = 1.1, f = 0.8, hw = w / 2 + ov;
      function rv(u) { return wall + f + rise * (1 - Math.abs(u - w / 2) / hw); }
      if (chim) { var cu = w * 0.64, cw = Math.max(2.2, w * 0.12); part(o, [[cu, rv(cu + cw) - 1.6], [cu, rv(cu) + 3.4], [cu + cw, rv(cu) + 3.4], [cu + cw, rv(cu + cw) - 1.6]]); }
      part(o, [[0, 0], [0, wall], [-ov, wall], [-ov, wall + f], [w / 2, wall + f + rise], [w + ov, wall + f], [w + ov, wall], [w, wall], [w, 0]]);
      return o;
    }
    function hip(x0, w, wall, rise, layer, chim, bY) {   // a house side-on, under a hipped roof
      var o = mk(x0, w, layer, true, bY), ov = 1.1, f = 0.8, hp = Math.min(rise * 1.15, w * 0.3), rg = wall + f + rise;
      if (chim) { var cu = w * 0.66; part(o, [[cu, rg - 1.6], [cu, rg + 3.2], [cu + 2.4, rg + 3.2], [cu + 2.4, rg - 1.6]]); }
      part(o, [[0, 0], [0, wall], [-ov, wall], [-ov, wall + f], [hp - ov, rg], [w - hp + ov, rg], [w + ov, wall + f], [w + ov, wall], [w, wall], [w, 0]]);
      return o;
    }
    function shed(x0, w, h1, h2) { var o = mk(x0, w, 0); part(o, [[0, 0], [0, h1], [-0.6, h1], [-0.6, h1 + 0.7], [w + 0.6, h2 + 0.7], [w + 0.6, h2], [w, h2], [w, 0]]); return o; }
    function row(x0, ws) {   // narrow gable-fronted town houses on one levelled street: plots alike, heights and pitches not
      var u = 0, tw = 0, j, f2; for (j = 0; j < ws.length; j++) tw += ws[j];
      var bY = natY(x0 + tw * Z / 2);
      for (j = 0; j < ws.length; j++) {
        var w = ws[j], o = mk(x0 + u * Z, w, 0, true, bY), wall = 16 + 9 * rr(), fl;
        if (j === 2 && ws.length > 4) { wall = 22 + 2 * rr(); part(o, [[0, 0], [0, wall + 1.4], [w, wall + 1.4], [w, 0]]); line(o, [[0, wall], [w, wall]]); fl = 3; }   // a later house with a flat parapet
        else { part(o, [[0, 0], [0, wall], [w / 2, wall + w * (0.42 + 0.2 * rr())], [w, wall], [w, 0]]); fl = Math.floor((wall - 2.5) / 6.4); }
        for (f2 = 0; f2 < fl; f2++) { win(o, w * 0.2, 2.6 + f2 * 6.4, 2.1, 3.3); win(o, w * 0.8 - 2.1, 2.6 + f2 * 6.4, 2.1, 3.3); }
        u += w;
      }
    }
    function civic(x0) {   // the town hall: two storeys under a hipped roof, its tower rising from the middle of the front
      var bY = natY(x0 + 24.5 * Z), hall = hip(x0, 49, 16, 8, 0, false, bY), t, tw = 11, sh = 54, cp = 8, j;
      for (j = 0; j < 3; j++) { win(hall, 3 + j * 5.5, 2.8, 2.2, 4); win(hall, 3 + j * 5.5, 9.4, 2.2, 4); win(hall, 32.8 + j * 5.5, 2.8, 2.2, 4); win(hall, 32.8 + j * 5.5, 9.4, 2.2, 4); }
      t = mk(x0 + 19 * Z, tw, 0, false, bY); t.rx = hall.x1;   // it goes with its hall
      part(t, [[0, 0], [0, sh], [-0.8, sh], [-0.8, sh + 1.4], [tw / 2, sh + 1.4 + cp], [tw + 0.8, sh + 1.4], [tw + 0.8, sh], [tw, sh], [tw, 0]]);
      strut(t, [[tw / 2, sh + 1.4 + cp], [tw / 2, sh + 5.4 + cp]]);
      line(t, [[0, 17], [tw, 17]]); line(t, [[0, 41], [tw, 41]]);
      win(t, 2.2, sh - 10, 1.8, 6); win(t, tw - 4, sh - 10, 1.8, 6); win(t, tw / 2 - 1.6, 0, 3.2, 6.2);
    }
    function blocks(x0, two) {   // flats behind, low houses in front of them
      var fh = 6.4, a = mk(x0, 50, 1), hA = 6 * fh + 2.2, f2, j, b, hB;
      part(a, [[31, hA - 1], [31, hA + 4.4], [42, hA + 4.4], [42, hA - 1]]);
      part(a, [[0, 0], [0, hA], [50, hA], [50, 0]]);
      line(a, [[0, hA - 1.3], [50, hA - 1.3]]);
      for (f2 = 0; f2 < 6; f2++) for (j = 0; j < 6; j++) win(a, 3.4 + j * 7.4, 2.4 + f2 * fh, 2.4, 3.1);
      if (two) {
        b = mk(x0 + 55 * Z, 37, 1); hB = 4 * fh + 2.2;
        part(b, [[0, 0], [0, hB], [37, hB], [37, 0]]);
        for (f2 = 0; f2 < 4; f2++) win(b, 2.6, 2.6 + f2 * fh, 31.8, 1.6);
      }
      hip(x0 + 4 * Z, 22, 9.5, 5.5, 0, true);
      if (two) gable(x0 + 66 * Z, 17, 10, 7.5, 0, false);
    }
    function works(x0) {   // a north-light shed and its chimney stack
      var s = mk(x0 + 5 * Z, 5.6, 1), sh = 60, o, wall = 13, nb = 4, bw = 58 / nb, th = 6.5, pts = [[0, 0], [0, wall]], j;
      part(s, [[0, 0], [0.9, sh], [0.4, sh], [0.4, sh + 1.8], [5.2, sh + 1.8], [5.2, sh], [4.7, sh], [5.6, 0]]);
      line(s, [[0.8, sh - 7], [4.8, sh - 7]]);
      o = mk(x0, 58, 0);
      for (j = 0; j < nb; j++) pts.push([j * bw, wall + th], [(j + 1) * bw, wall]);
      pts.push([58, 0]); part(o, pts); s.rx = o.x1;   // the stack goes with its shed: no chimney left standing alone
      for (j = 0; j < 6; j++) win(o, 4 + j * 9.2, 6.2, 3.4, 3.2);
    }
    function waterTower(x0) {
      var o = mk(x0, 20, 0), lg = 36, j;
      strut(o, [[1.2, 0], [3.2, lg]]); strut(o, [[18.8, 0], [16.8, lg]]);
      line(o, [[7.6, 0], [8.4, lg]]); line(o, [[12.4, 0], [11.6, lg]]);
      for (j = 0; j < 3; j++) {
        var v0 = j * 12, v1 = v0 + 12, a0 = 1.2 + 2 * v0 / lg, a1 = 1.2 + 2 * v1 / lg;
        line(o, [[a0, v0], [20 - a1, v1]]); line(o, [[20 - a0, v0], [a1, v1]]);
        if (j) line(o, [[a0, v0], [20 - a0, v0]]);
      }
      part(o, [[-0.6, lg], [-0.6, lg + 13], [10, lg + 18.5], [20.6, lg + 13], [20.6, lg]]);
      line(o, [[-0.6, lg + 13], [20.6, lg + 13]]); line(o, [[-1.6, lg + 1.2], [21.6, lg + 1.2]]);
      strut(o, [[10, lg + 18.5], [10, lg + 21]]);
      o.edges = [x0 + 1.2 * Z, x0 + 18.8 * Z, x0 + 8 * Z, x0 + 12 * Z];
    }
    function farm(x0) {   // a barn and its silo
      var b = mk(x0, 30, 0), wall = 10.5, s, sh = 29;
      part(b, [[0, 0], [0, wall], [-0.8, wall], [3.4, wall + 6.2], [15, wall + 11.5], [26.6, wall + 6.2], [30.8, wall], [30, wall], [30, 0]]);
      line(b, [[11, 0], [11, 8], [19, 8], [19, 0]]);
      s = mk(x0 + 33 * Z, 8, 0);
      part(s, [[0, 0], [0, sh], [1.1, sh + 2.4], [4, sh + 3.4], [6.9, sh + 2.4], [8, sh], [8, 0]]);
      line(s, [[0, sh * 0.34], [8, sh * 0.34]]); line(s, [[0, sh * 0.67], [8, sh * 0.67]]);
    }
    function tree(xc, w, hh) {   // drawn as an outline with its branches: not a ball on a stick
      var o = mk(xc - w / 2 * Z, w, 0, false), cy = hh * 0.6, ry = hh * 0.4, rx = w / 2, a1 = rr() * 6.28, a2 = rr() * 6.28, a3 = rr() * 6.28, pts = [], j;
      o.la = 0.5; o.da = 0.4; o.lw = 0.85; o.edges = [xc];
      for (j = 0; j < 34; j++) {
        var th = j / 34 * 6.2832, r = 1 + 0.075 * Math.sin(3 * th + a1) + 0.05 * Math.sin(7 * th + a2) + 0.035 * Math.sin(12 * th + a3);
        pts.push([w / 2 + Math.cos(th) * rx * r, cy + Math.sin(th) * ry * r]);
      }
      part(o, pts);
      var tb = cy - ry * 0.9;
      strut(o, [[w / 2, 0], [w / 2, tb]]);
      line(o, [[w / 2, tb], [w / 2 - rx * 0.32, cy + ry * 0.15]]); line(o, [[w / 2, tb], [w / 2 + rx * 0.06, cy + ry * 0.5]]); line(o, [[w / 2 + rx * 0.02, cy - ry * 0.3], [w / 2 + rx * 0.4, cy + ry * 0.2]]);
      return o;
    }
    function poplar(xc, w, hh) {
      var o = mk(xc - w / 2 * Z, w, 0, false), v0 = hh * 0.1, pts = [], j, t, r;
      o.la = 0.5; o.da = 0.36; o.lw = 0.85; o.edges = [xc];
      for (j = 0; j <= 14; j++) { t = j / 14; r = Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + t * 0.94)), 0.7) * (1 + 0.07 * Math.sin(j * 2.1 + xc)); pts.push([w / 2 + r * w / 2, v0 + t * (hh - v0)]); }
      for (j = 14; j >= 0; j--) { t = j / 14; r = Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + t * 0.94)), 0.7) * (1 + 0.07 * Math.sin(j * 1.7 + xc * 0.7)); pts.push([w / 2 - r * w / 2, v0 + t * (hh - v0)]); }
      part(o, pts); strut(o, [[w / 2, 0], [w / 2, v0 + 1.5]]); line(o, [[w / 2, v0 + 1], [w / 2, hh * 0.78]]);
      return o;
    }
    // ---- the town
    x = t0 + Math.max(0, span - used) / 2;
    var townX0 = x;
    for (i = 0; i < use.length; i++) {
      var c = use[i], cw = c[1] * Z, gw = (i < use.length - 1 ? c[3] : 0) * Z * stretch, gx = x + cw + gw / 2;
      if (c[0] === 'row4') row(x, [13, 14.5, 12, 12.5]);
      else if (c[0] === 'row6') row(x, [13, 14.5, 12.5, 15, 13.5, 12.5]);
      else if (c[0] === 'civic') civic(x);
      else if (c[0] === 'block1') blocks(x, false);
      else if (c[0] === 'blocks2') blocks(x, true);
      else if (c[0] === 'houses2') { gable(x, 18, 12, 8.5, 0, true); hip(x + 24 * Z, 26, 10.5, 6.5, 0, false); }
      else if (c[0] === 'houses3') { gable(x, 19, 12, 9, 0, true); hip(x + 25 * Z, 28, 11, 7, 0, false); gable(x + 59 * Z, 16, 10.5, 8, 0, false); shed(x + 78 * Z, 8, 6.5, 5); }
      else if (c[0] === 'housesW') { gable(x, 18, 11, 8.5, 0, false); hip(x + 25 * Z, 30, 11.5, 7, 0, true); shed(x + 60 * Z, 10, 7, 5.5); }
      else if (c[0] === 'works') works(x);
      else if (c[0] === 'wt') waterTower(x);
      if (c[3] >= 16 && i < use.length - 1) {   // a tree in the gaps left for one
        if (c[0] === 'civic') { poplar(gx - 3.4 * Z, 6, 30); poplar(gx + 3.6 * Z, 6, 34); }
        else tree(gx, Math.min(17, gw / Z - 3), 22);
      }
      x += cw + gw;
    }
    var townX1 = x;
    // ---- the country around it (the east side is placed after the bridge, below)
    if (!sm) {
      tree(0.032 * W, 24, 30); tree(0.054 * W, 28, 35); tree(0.075 * W, 21, 26);   // a copse on the hill
      if (townX0 - 0.1 * W > 50 * Z) farm(0.1 * W);
    }
    // ---- the ground as surveyed: natural, with the building plots levelled; sampled every 2-4px (coarser on wide screens)
    var st = W > 2200 ? 4 : W > 1100 ? 3 : 2, n = Math.ceil((W + 40) / st) + 2, ys = [];
    for (i = 0; i < n; i++) ys.push(natY(-20 + i * st));
    objs.forEach(function (o) {
      if (!o.plot) return;
      var a = o.x0 - 1, b = o.x1 + 1, rp = 4;
      for (var j = Math.max(0, Math.floor((a - rp + 20) / st)); j < n && -20 + j * st <= b + rp; j++) {
        var xx = -20 + j * st, t = xx < a ? (xx - (a - rp)) / rp : xx > b ? (b + rp - xx) / rp : 1;
        ys[j] = lerp(ys[j], o.base, clamp(t, 0, 1));
      }
    });
    function yAt(xx) { var f = (xx + 20) / st, j = Math.floor(f); if (!(j >= 0)) return ys[0]; if (j >= n - 1) return ys[n - 1]; return lerp(ys[j], ys[j + 1], f - j); }
    // ---- the river and its bridge
    var rb = bumps[sm ? 1 : 2], rc = rb[0] * W, rw = rb[2] * W, yw = base + 4 * Z, wx0 = rc, wx1 = rc;
    while (wx0 > rc - rw && yAt(wx0 - 1) > yw) wx0 -= 1;
    while (wx1 < rc + rw && yAt(wx1 + 1) > yw) wx1 += 1;
    var water = wx1 - wx0 > 4 ? { x0: wx0, x1: wx1, y: yw } : null;
    var xa = rc - rw * 1.32, xb = rc + rw * 1.32, sL = rc - rw * 0.6, sR = rc + rw * 0.6;
    var yP = Math.min(yAt(xa), yAt(xb)) - 3.6 * Z, yD = yP + 1.7 * Z, yA = yD + 2.2 * Z, ySL = yAt(sL), ySR = yAt(sR), cyA = 2 * yA - (ySR + ySL) / 2;
    var bp = [[xa, yP], [xb, yP], [xb, yAt(xb)]];
    for (x = xb - 2; x > sR; x -= 2) bp.push([x, yAt(x)]);
    for (k = 0; k <= 16; k++) { var tq = k / 16, uq = 1 - tq; bp.push([uq * uq * sR + 2 * uq * tq * rc + tq * tq * sL, uq * uq * ySR + 2 * uq * tq * cyA + tq * tq * ySL]); }
    for (x = sL - 2; x > xa; x -= 2) bp.push([x, yAt(x)]);
    bp.push([xa, yAt(xa)]);
    objs.push({ x0: xa, x1: xb, base: yP, layer: 0, plot: false, parts: [bp], struts: [], lines: [[[xa, yD], [xb, yD]]], wins: [], edges: [xa, xb], top: yP, la: 0.66, da: 0.4, lw: 1 });
    x = xb + W * 0.012;
    if (!sm) {
      poplar(x, 6, 32); poplar(x + W * 0.014, 6, 37); poplar(x + W * 0.028, 6, 30); x += W * 0.06;
      if (x + 70 * Z < W - 6) { hip(x, 24, 10, 6, 0, true); farm(x + 30 * Z); x += 74 * Z; }
      if (x + 20 * Z < W) tree(Math.max(x + 14 * Z, 0.968 * W), 22, 27);
    } else if (x + 4 < W) { poplar(x + 2, 5.5, 28); if (x + 30 * Z < W) tree(x + 16 * Z, 16, 21); }   // phones: only what fits past the bridge
    // ---- survey stakes at one spacing; only the row's phase is chosen, so that none stands on a wall, a leg or a trunk
    var sp = sm ? 40 : Math.round(40 * clamp(Z, 1.2, 2)), avoid = [], best = 0, bestS = -1e9, o2, sx;
    objs.forEach(function (o) { avoid.push.apply(avoid, o.edges); });
    for (o2 = 0; o2 < sp; o2 += 0.5) {
      var hits = 0, clear = 1e9;
      for (sx = W - 8 - o2; sx > 6; sx -= sp) for (k = 0; k < avoid.length; k++) { var dd = Math.abs(sx - avoid[k]); if (dd < 3.5) hits++; if (dd < clear) clear = dd; }
      var score = -hits * 1000 + Math.min(clear, 8);
      if (score > bestS) { bestS = score; best = o2; }
    }
    var stakes = []; for (sx = W - 8 - best; sx > 6; sx -= sp) stakes.push(sx);
    // ---- the front's run: from past the right edge until the cut has left the screen on the left
    var cmax = 0; for (x = -20; x <= 40; x += 2) cmax = Math.max(cmax, Math.abs(yAt(x) - gy) * 1.1 + 1);
    var top = gy; objs.forEach(function (o) { if (o.top < top) top = o.top; });
    var back = objs.filter(function (o) { return o.layer; }), front = objs.filter(function (o) { return !o.layer; });
    G.hw = { R: R, gy: gy, Z: Z, ys: ys, n: n, st: st, yAt: yAt, objs: back.concat(front), stakes: stakes, sp: sp, water: water, top: top,
             town: [townX0, townX1], sh: sm ? 17 : 24, rod: sm ? 1.5 : 1.8, band: (sm ? 14 : 18) * Math.min(Z, 1.25), hs: sm ? 4 : W > 2200 ? 6 : 4.5, zd: clamp(Z, 0.8, 1.25),
             lead: lead, bottom: Math.min(H + 20, R.y + R.h + H * 0.5), f0: W + 20, f1: -30 - ((small ? 90 : 150) + (small ? 70 : 110)) * Math.min(Z, 1.4), front: W + 20,   // the front runs until the last grain has blown off the left edge
             planU: 0, fS: fS };
  },
  frame: function (S, p) {
    if (S.relaid || !G.hw) this.lay(S);
    var h = G.hw, PP = this.P(); if (!(p >= 0)) p = 0;
    h.planU = clamp((p - PP.P0) / (PP.P1 - PP.P0), 0, 1);
    h.front = h.f0 - (h.f0 - h.f1) * clamp((p - PP.P2) / (PP.P3 - PP.P2), 0, 1);   // one speed, no easing: it neither aims at the town nor slows for it
  },
  back: function (S, col) {
    var h = G.hw; if (!h) return;
    var gy = h.gy, Z = h.Z, fx = h.front, T = ctx.getTransform(), ty = T.f / DPR, i, j, k, x;
    var J = (small ? 90 : 150) * Math.min(Z, 1.4), D = (small ? 70 : 110) * Math.min(Z, 1.4), cs = small ? 2.5 : 3;   // the band that crumbles, how far its dust blows, the size of a grain
    var cut = fx < W + 20;
    var yTop = gy - h.sh - 4;   // riding away: gone before its highest mark can sit under the bar
    for (k = 0; k < h.objs.length; k++) { var ob = h.objs[k]; if (ob.x0 < fx + J && ob.top < yTop) yTop = ob.top; }
    if (cut) for (i = Math.max(0, Math.ceil((fx + J + 20) / h.st)); i < h.n; i += 2) if (h.ys[i] < yTop) yTop = h.ys[i];
    var fa = smooth((yTop + ty - barH - 12) / 90);
    if (!(fa > 0.004)) return;
    var M = curM || MOODS.overcast, Hs = H > 0 ? H : 1, ga, main = ctx;
    function ink(a) { return rgba(col, a); }
    function unit(v) { return v > 0 ? (v < 1 ? v : 1) : 0; }
    function trace(pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (var q = 1; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]); }
    function hsh(a, b) { var t = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return t - Math.floor(t); }
    // everything of ours above the level is drawn whole on its own sheet; then, from the front, it crumbles into grains that blow away
    if (!h.oc) { h.oc = document.createElement('canvas'); h.octx = h.oc.getContext('2d'); }
    // the sheet covers only the strip the town stands in, in device pixels
    var oy = Math.floor(T.d * (h.top - 50) + T.f), ohh = Math.max(1, Math.ceil(T.d * (gy + 4) + T.f) - oy);
    if (h.oc.width !== cv.width || h.oc.height !== ohh) { h.oc.width = cv.width; h.oc.height = ohh; }
    var oc = h.octx;
    main.save();
    try {
      main.globalAlpha *= fa; ga = main.globalAlpha;
      // (1) under the level: the earth, faintly, and once the land above is gone, the level in section
      var deep = Math.max(gy + 20, Math.min(h.bottom, gy + 120 * Z));
      ctx.beginPath(); ctx.moveTo(-20, gy); ctx.lineTo(W + 20, gy); ctx.lineTo(W + 20, deep); ctx.lineTo(-20, deep); ctx.closePath();
      var eg = ctx.createLinearGradient(0, gy, 0, deep); eg.addColorStop(0, ink(0.05)); eg.addColorStop(1, ink(0)); ctx.fillStyle = eg; ctx.fill();
      if (cut) {
        var xs = Math.max(-20, fx), bd = h.band;
        ctx.save(); ctx.beginPath(); ctx.rect(xs, gy, W + 20 - xs, bd); ctx.clip();
        ctx.strokeStyle = ink(0.2); ctx.lineWidth = 0.75; ctx.beginPath();
        for (x = Math.floor((xs - bd) / h.hs) * h.hs; x < W + 20; x += h.hs) { ctx.moveTo(x, gy + bd); ctx.lineTo(x + bd, gy); }
        ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.moveTo(xs, gy); ctx.lineTo(W + 20, gy); ctx.strokeStyle = ink(0.74); ctx.lineWidth = 1.45; ctx.stroke();
        // the record of the old ground where nothing is left: the land's shape, dashed
        var i0 = Math.max(0, Math.ceil((fx + J + D + 20) / h.st)); i0 += i0 % 2;
        if (i0 < h.n) {
          ctx.setLineDash([3 * h.zd, 3 * h.zd]); ctx.lineDashOffset = -20 + i0 * h.st; ctx.strokeStyle = ink(0.22); ctx.lineWidth = 0.7; ctx.beginPath();
          ctx.moveTo(-20 + i0 * h.st, h.ys[i0]); for (i = i0 + 2; i < h.n; i += 2) ctx.lineTo(-20 + i * h.st, h.ys[i]);
          ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
        }
      }
      // (2) our world, whole, on the sheet: the ground above the level, the river, the town, the trees
      var xEnd = Math.min(W + 20, fx + J + D);
      if (xEnd > -20) {
        oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, h.oc.width, h.oc.height); oc.setTransform(T.a, 0, 0, T.d, T.e, T.f - oy);
        ctx = oc;
        ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(-20, gy); for (i = 0; i < h.n; i++) ctx.lineTo(-20 + i * h.st, h.ys[i]); ctx.lineTo(W + 20, gy); ctx.closePath();
        ctx.fillStyle = ink(0.06); ctx.fill();
        if (h.planU > 0) {   // the ground the plan will take, hatched as the level is ruled
          if (h.hmax == null) { h.hmax = 0; for (i = 0; i < h.n; i++) h.hmax = Math.max(h.hmax, gy - h.ys[i]); h.hmax += 4; }
          var hx = W + 20 - (W + 40) * h.planU, L = h.hmax, hstep = small ? 6 : 7;
          ctx.save(); ctx.clip();
          ctx.strokeStyle = ink(0.12); ctx.lineWidth = 0.6; ctx.beginPath();
          for (x = Math.floor((hx - L) / hstep) * hstep; x < W + 22; x += hstep) { if (x + L < hx) continue; ctx.moveTo(x, gy - L); ctx.lineTo(x + L, gy); }
          ctx.stroke(); ctx.restore();
        }
        ctx.beginPath(); ctx.moveTo(-20, h.ys[0]); for (i = 1; i < h.n; i++) ctx.lineTo(-20 + i * h.st, h.ys[i]);
        ctx.strokeStyle = ink(0.6); ctx.lineWidth = 1.1; ctx.stroke();
        var wt = h.water;
        if (wt) {
          var ww = wt.x1 - wt.x0; ctx.strokeStyle = ink(0.42); ctx.lineWidth = 0.8; ctx.beginPath();
          ctx.moveTo(wt.x0, wt.y); ctx.lineTo(wt.x1, wt.y);
          ctx.moveTo(wt.x0 + ww * 0.2, wt.y + 2.4 * Z); ctx.lineTo(wt.x1 - ww * 0.2, wt.y + 2.4 * Z);
          ctx.moveTo(wt.x0 + ww * 0.38, wt.y + 4.6 * Z); ctx.lineTo(wt.x1 - ww * 0.38, wt.y + 4.6 * Z); ctx.stroke();
        }
        var M0 = skyAt(M, unit((h.top - 4 + ty) / Hs)), M1 = skyAt(M, unit((gy + 4 + ty) / Hs));
        var paper = ctx.createLinearGradient(0, h.top - 4, 0, gy + 4);
        paper.addColorStop(0, rgba(mixc(M0, col, 0.035))); paper.addColorStop(1, rgba(mixc(M1, col, 0.035)));
        for (k = 0; k < h.objs.length; k++) {
          var o = h.objs[k]; if (o.x1 < -20 || o.x0 > xEnd) continue;
          for (i = 0; i < o.parts.length; i++) {
            ctx.beginPath(); trace(o.parts[i]); ctx.closePath();
            ctx.fillStyle = paper; ctx.fill(); ctx.strokeStyle = ink(o.la); ctx.lineWidth = o.lw; ctx.stroke();
          }
          if (o.wins.length) { ctx.fillStyle = ink(0.26); ctx.beginPath(); for (i = 0; i < o.wins.length; i++) { var wn = o.wins[i]; ctx.rect(wn[0], wn[1], wn[2], wn[3]); } ctx.fill(); }
          if (o.lines.length) { ctx.strokeStyle = ink(o.da); ctx.lineWidth = 0.6; ctx.beginPath(); for (i = 0; i < o.lines.length; i++) trace(o.lines[i]); ctx.stroke(); }
          if (o.struts.length) { ctx.strokeStyle = ink(o.la); ctx.lineWidth = o.lw; ctx.beginPath(); for (i = 0; i < o.struts.length; i++) trace(o.struts[i]); ctx.stroke(); }
        }
        // (3) the crumbling: grains fixed to the land, each letting go at its own moment inside the band ahead of the front
        var specks = [];
        if (cut) {
          var c0 = Math.floor(Math.max(-20, fx) / cs), c1 = Math.ceil(xEnd / cs), r0 = Math.floor((h.top - 8) / cs), r1 = Math.ceil((gy + 1) / cs);
          var dx0 = Math.max(0, Math.floor(T.a * c0 * cs + T.e)), dx1 = Math.min(h.oc.width, Math.ceil(T.a * c1 * cs + T.e) + 1);
          var dy0 = Math.max(0, Math.floor(T.d * r0 * cs + T.f) - oy), dy1 = Math.min(h.oc.height, Math.ceil(T.d * r1 * cs + T.f) - oy + 1);
          var img = dx1 > dx0 && dy1 > dy0 ? oc.getImageData(dx0, dy0, dx1 - dx0, dy1 - dy0) : null, iw = dx1 - dx0;
          ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.beginPath();
          for (var cc = c0; cc < c1; cc++) for (var rr2 = r0; rr2 < r1; rr2++) {
            var gx = cc * cs, gyy = rr2 * cs, n = hsh(cc, rr2), d = gx - fx - n * J;
            if (d <= 0) continue;
            ctx.rect(gx, gyy, cs, cs);   // this grain has let go
            if (d < D && img) {
              var px = Math.floor(T.a * (gx + cs / 2) + T.e) - dx0, py = Math.floor(T.d * (gyy + cs / 2) + T.f) - oy - dy0;
              if (px >= 0 && py >= 0 && px < iw && py < dy1 - dy0) { var al = img.data[(py * iw + px) * 4 + 3]; if (al > 12) specks.push(gx, gyy, d / D, n, al / 255); }
            }
          }
          if (W + 20 > fx + J) ctx.rect(Math.max(-20, fx + J), h.top - 40, W + 40 - Math.max(-20, fx + J), gy - h.top + 42);   // past the band, nothing is left
          ctx.fill(); ctx.globalCompositeOperation = 'source-over';
        }
        ctx = main;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(h.oc, 0, oy); ctx.restore();
        // the dust: each grain drifts off on the wind, thinning as it goes
        for (k = 0; k < specks.length; k += 5) {
          var e = ease(specks[k + 2]), nn = specks[k + 3];
          var sxp = specks[k] + e * (24 + 60 * hsh(nn, 3.1)) * Z, syp = specks[k + 1] - e * (12 + 44 * hsh(nn, 7.7)) * Z;
          ctx.fillStyle = ink(0.75 * specks[k + 4] * (1 - e) * (1 - e)); ctx.fillRect(sxp, syp, cs * 0.8, cs * 0.8);
        }
      }
      // (4) the level, ruled right to left across all the land as the stakes go in; a chain line (dash-dot), fixed to the land
      var x0 = W + 20 - (W + 40) * h.planU, x1 = Math.min(fx, W + 20), sp = h.sp;
      if (h.planU > 0 && x0 < x1) {
        ctx.setLineDash([12 * h.zd, 3 * h.zd, 2 * h.zd, 3 * h.zd]); ctx.lineDashOffset = x0;
        ctx.strokeStyle = ink(0.68); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
      // (5) the stakes: one spacing, in the fields, the river and the town alike; once the land is gone they stand on the level
      if (h.planU > 0) {
        var pS = [], pO = [];
        for (k = 0; k < h.stakes.length; k++) {
          var sx = h.stakes[k], a = clamp((sx - x0) / (sp * 0.8), 0, 1); if (a <= 0) continue;
          var yb = sx > fx + J * 0.5 ? gy : h.yAt(sx);
          pS.push(sx, yb, yb - h.sh * a);
          if (Math.abs(yb - gy) > 1) pO.push(sx, yb, lerp(yb, gy, a));
        }
        ctx.lineWidth = 0.6; ctx.strokeStyle = ink(0.28); ctx.beginPath();
        for (k = 0; k < pO.length; k += 3) { ctx.moveTo(pO[k], pO[k + 1]); ctx.lineTo(pO[k], pO[k + 2]); }
        ctx.stroke();
        var bl = h.sh / 4;
        ctx.lineWidth = h.rod;
        for (var par = 0; par < 2; par++) {
          ctx.strokeStyle = ink(par ? 0.3 : 0.8); ctx.beginPath();
          for (k = 0; k < pS.length; k += 3) {
            var len = pS[k + 1] - pS[k + 2];
            for (j = par; j < 4 && j * bl < len; j += 2) { ctx.moveTo(pS[k], pS[k + 1] - j * bl); ctx.lineTo(pS[k], pS[k + 1] - Math.min(len, (j + 1) * bl)); }
          }
          ctx.stroke();
        }
        ctx.lineWidth = 0.8; ctx.strokeStyle = ink(0.6); ctx.beginPath();
        for (k = 0; k < pS.length; k += 3) { ctx.moveTo(pS[k] - 2.5, pS[k + 1]); ctx.lineTo(pS[k] + 2.5, pS[k + 1]); }
        ctx.stroke();
      }
    } finally { ctx = main; main.restore(); }
  }
};

/* inner alignment: perfect while measured, its own way when not */
SC.inner = {
  geom: function (S, p) {
    // the frame (0.7 of a step outside the grid on each side) must fit inside the picture, under the bar
    var R = S.R, top = Math.max(R.y, barH + 8), avail = R.y + R.h - top, gw = small ? Math.min(R.w * 0.78, avail * 0.8 / 1.14) : Math.min(R.w * 0.42, avail * 0.8 / 1.14), step = gw / 10;
    var ox = small ? R.x + (R.w - gw) / 2 : R.x + R.w * 0.16 + smooth(p / 0.42) * R.w * 0.1, oy = R.y + R.h - gw * 1.07;
    return { step: step, ox: ox, oy: oy, gw: gw };
  },
  enter: function (S) { var g = this.geom(S, 0); for (var i = 0; i < N; i++) setTarget(B[i], { kind: 'pin', x: g.ox + (i % 10 + 0.5) * g.step, y: g.oy + (Math.floor(i / 10) + 0.5) * g.step, k: 0.09, ang: 0 }, rnd() * 500); G.inner = { g: g, frameA: 0, lift: 0 }; this.t0 = S.placed ? -1e9 : performance.now(); },
  frame: function (S, p, now) {
    var g = this.geom(S, p), gph = now * 0.012;
    var Rk = small ? { x: S.R.x, y: S.R.y - S.R.h * 0.05, w: S.R.w, h: S.R.h * 0.6 } : { x: S.R.x + S.R.w * 0.62, y: S.R.y, w: S.R.w * 0.36, h: S.R.h * 0.8 };
    if (S.leaving && !reduced) Rk.x += Math.min(W, S.lt * 0.42);   // its own way: off to the right
    for (var i = 0; i < N; i++) {
      var b = B[i], col = i % 10, row = Math.floor(i / 10);
      var gx = g.ox + (col + 0.5) * g.step, gy = g.oy + (row + 0.5) * g.step;
      var th = 0.42 + 0.16 * ((9 - col) / 9) + 0.03 * b.rank, f = smooth((p - th) / 0.12);
      var k = knot(i, now, Rk, 0.85);
      b.tg.x = lerp(gx, k.x, f); b.tg.y = lerp(gy, k.y, f); b.tg.k = 0.12 + f * 0.05; b.tg.ang = f > 0.5 ? k.ang : 0;
      b.ph = f < 0.2 ? gph : b.ph;
      b.depth = k.z * f;
    }
    G.inner = { g: g, frameA: (1 - smooth((p - 0.36) / 0.1)) * clamp((now - this.t0 - 1300) / 450, 0, 1), lift: 0 };
  },
  back: function (S, col) {
    var I = G.inner; if (!I || I.frameA <= 0) return;
    var g = I.g, pad = g.step * 0.7, x0 = g.ox - pad, y0 = g.oy - pad - I.lift, x1 = g.ox + g.gw + pad, y1 = g.oy + g.gw + pad - I.lift, L = Math.min(34, g.gw * 0.16);
    ctx.strokeStyle = rgba(col, 0.7 * I.frameA); ctx.lineWidth = 1.5; ctx.lineCap = 'square';
    [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(function (c) { ctx.beginPath(); ctx.moveTo(c[0] + c[2] * L, c[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0], c[1] + c[3] * L); ctx.stroke(); });
  }
};

/* first light: they come back, a few at a time, rising out of the light low on the screen (right of the caption,
   never through it), and settle on a line like the first screen's. Once back, they stay. */
function unevenSlots(nw, per) {   // birds sit the way birds sit: uneven gaps, a few close pairs
  var out = [];
  for (var w = 0; w < nw; w++) for (var j = 0, n = 0; j < per + 6 && n < per; j++) { if (rnd() < 0.14) continue; out.push({ w: w, t: 0.04 + 0.92 * clamp((j + 0.5 + (rnd() - 0.5) * 0.62) / (per + 6), 0, 1) }); n++; }
  return out;
}
SC.ret = {
  lay: function (S) {
    var R = S.R, tr = 0;
    Array.prototype.forEach.call(S.el.querySelectorAll('.cap h2, .cap .dek'), function (e) { var rg = document.createRange(); rg.selectNodeContents(e); tr = Math.max(tr, rg.getBoundingClientRect().right); });   // the text, not its box
    var x0 = small ? R.x : Math.max(R.x + R.w * 0.3, tr + 70);
    if (!small && R.x + R.w - x0 < 200) x0 = R.x;   // no room beside the caption: across the sky
    var A = { x: x0, y: R.y, w: R.x + R.w - x0, h: R.h }, was = G.ret && G.ret.ws;
    G.ret = G.ret || {}; G.ret.ws = anchorWires(was, rowsAt(A, 0.56, 34, 6)); G.ret.minx = x0 + 10;
    if (was && G.ret.ws !== was) G.ret.fresh = true;
  },
  enter: function (S) {
    G.ret = null; this.lay(S); this.state = []; this.t0 = S.placed ? -1e9 : performance.now();
    var w0 = G.ret.ws[0], per = Math.max(8, Math.min(36, Math.floor(Math.abs(w0.x1 - w0.x0) * 0.92 / 15)));
    this.seat = unevenSlots(G.ret.ws.length, per);
    for (var i = 0; i < N; i++) this.state[i] = i < this.seat.length ? 0 : -1;   // -1: not in this picture
  },
  frame: function (S, p, now) {
    if (S.relaid) { this.lay(S); if (G.ret.fresh) { G.ret.fresh = false; for (var r = 0; r < N; r++) { var tb = B[r].tg; if (this.state[r] === 1 && tb && tb.wire) { var sr = this.seat[r]; tb.wire = G.ret.ws[Math.min(sr.w, G.ret.ws.length - 1)]; tb.t = sr.t; } } } }
    // the first groups rise while the picture comes up the screen; the rest once the caption has pinned
    var pad = S.el._pad || 0, ride = pad ? clamp((H * 0.85 - S.el.getBoundingClientRect().top) / pad, 0, 1) : 1;
    for (var i = 0; i < N; i++) {
      if (this.state[i] !== 0) continue;
      var b = B[i], g = Math.floor(b.rank * 8);
      if ((g < 3 && ride > 0.45 + 0.18 * g) || p > 0.04 + 0.045 * g) {
        this.state[i] = 1; var sl = this.seat[i];
        var tg = perchOn(G.ret.ws[Math.min(sl.w, G.ret.ws.length - 1)], sl.t, i % 4 ? -1 : 1); tg.from = small ? 'right' : 'below'; tg.minx = G.ret.minx; tg.v = 3.1; setTarget(b, tg, rnd() * 420);
      }
    }
  },
  back: function (S, col) {   // the line is there from the start, faint, and firms up as they settle on it
    var per = 0; for (var i = 0; i < N; i++) if (this.state[i] === 1 && B[i].st === 'perched') per++;
    var a = (0.3 + 0.25 * Math.min(1, per / 20)) * clamp((performance.now() - this.t0) / 420, 0, 1);
    if (a > 0.01) G.ret.ws.forEach(function (w) { strokeWire(w, col, a); });
  }
};

/* the poll, Quinnipiac Sept 2026: speed carries the answer.
   30 stop (still, on the wire) · 47 slow down (a slow circle) · 14 current pace · 5 faster (racing) · 4 not sure (hovering) */
var POLL = [
  { n: 30, kind: 'stop', label: '30 stop' },
  { n: 47, kind: 'orbit', speed: 0.00045, label: '47 slow down' },
  { n: 14, kind: 'orbit', speed: 0.0016, label: '14 keep the current pace' },
  { n: 5, kind: 'orbit', speed: 0.0058, fast: true, label: '5 go faster' },
  { n: 4, kind: 'hover', label: '4 not sure' }
];
SC.count = {
  entry: 'fade',   // a chart: it appears whole, then its groups move at their own speeds
  lay: function (S) {
    var R = S.R, C = { groups: [], R: R, la: 0 };
    if (!small) {
      var gy = R.y + R.h * 0.5;
      C.groups[0] = { wire: new Wire(R.x, R.y + R.h * 0.66, R.x + R.w * 0.3, R.y + R.h * 0.66, 4), lx: R.x + R.w * 0.15, ly: R.y + R.h * 0.66 + 38 };
      C.groups[1] = { cx: R.x + R.w * 0.49, cy: gy, rx: Math.min(R.w * 0.105, 150), ry: Math.min(R.h * 0.24, 105) };
      C.groups[2] = { cx: R.x + R.w * 0.71, cy: gy, rx: Math.min(R.w * 0.06, 80), ry: Math.min(R.h * 0.16, 70) };
      C.groups[3] = { cx: R.x + R.w * 0.89, cy: gy, rx: Math.min(R.w * 0.055, 72), ry: Math.min(R.h * 0.15, 64) };
      C.groups[4] = { x: R.x + R.w * 0.15, y: R.y + R.h * 0.2 };
    } else {
      C.groups[0] = { wire: new Wire(R.x, R.y + R.h * 0.2, R.x + R.w, R.y + R.h * 0.2, 4), lx: R.x + R.w * 0.5, ly: R.y + R.h * 0.2 + 30 };
      C.groups[1] = { cx: R.x + R.w * 0.27, cy: R.y + R.h * 0.56, rx: R.w * 0.22, ry: R.h * 0.13 };
      C.groups[2] = { cx: R.x + R.w * 0.76, cy: R.y + R.h * 0.5, rx: R.w * 0.13, ry: R.h * 0.075 };
      C.groups[3] = { cx: R.x + R.w * 0.76, cy: R.y + R.h * 0.8, rx: R.w * 0.13, ry: R.h * 0.07 };
      C.groups[4] = { x: R.x + R.w * 0.27, y: R.y + R.h * 0.88 };
    }
    G.count = C;
  },
  member: function (i) { var acc = 0; for (var g = 0; g < POLL.length; g++) { if (i < acc + POLL[g].n) return [g, i - acc]; acc += POLL[g].n; } return [POLL.length - 1, 0]; },
  enter: function (S) {
    this.lay(S);
    for (var i = 0; i < N; i++) {
      var m = this.member(i), g = m[0], k = m[1], P = POLL[g], Cg = G.count.groups[g];
      if (P.kind === 'stop') setTarget(B[i], perchOn(Cg.wire, 0.03 + 0.94 * (k + 0.5) / P.n, k % 5 === 0 ? 1 : -1), 200 + rnd() * 1000);
      else if (P.kind === 'hover') setTarget(B[i], { kind: 'hover', x: Cg.x, y: Cg.y }, 0);
      else setTarget(B[i], { kind: 'pin', x: Cg.cx, y: Cg.cy, k: 0.04 }, 0);
    }
    this.t0 = performance.now() - 1600;   // the orbits are already at speed when it appears
  },
  frame: function (S, p, now) {
    if (S.relaid) { this.lay(S); for (var r = 0; r < POLL[0].n; r++) if (B[r].tg && B[r].tg.wire) B[r].tg.wire = G.count.groups[0].wire; }
    var C = G.count, ramp = clamp((now - this.t0) / 1600, 0, 1);
    for (var i = 0; i < N; i++) {
      var m = this.member(i), g = m[0], k = m[1], P = POLL[g], Cg = C.groups[g], b = B[i];
      if (P.kind === 'orbit') {
        var a = now * P.speed + (k / P.n) * 6.283, wob = P.fast ? 0 : Math.sin(now * 0.001 + k) * 3;
        b.tg.x = Cg.cx + Math.cos(a) * (Cg.rx + wob); b.tg.y = Cg.cy + Math.sin(a) * (Cg.ry + wob);
        b.tg.k = lerp(0.04, P.fast ? 0.5 : 0.25, ramp); b.tg.ang = clamp(Math.cos(a) * 0.5, -0.5, 0.5);
        b.tg.fast = !!P.fast; b.fs = P.fast ? 1.6 : P.speed < 0.001 ? 0.55 : 0.95;
      } else if (P.kind === 'hover') { var a2 = now * 0.0011 + k * 1.57; b.tg.x = Cg.x + (k - 1.5) * (small ? 16 : 20) + Math.cos(a2) * 3; b.tg.y = Cg.y + Math.sin(a2 * 1.3) * 4 + (k % 2) * 8; }
    }
    C.la = 1;   // the labels come with the chart: the entry fade carries them
  },
  back: function (S, col) { if (G.count) strokeWire(G.count.groups[0].wire, col, 0.55); },
  front: function (S, col) {
    var C = G.count; if (!C || C.la <= 0) return;
    ctx.font = small ? '600 13px "Alegreya Sans", sans-serif' : labelFont; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
    function lab(t, x, y) { ctx.fillStyle = rgba(inkAt(curM, y), C.la); ctx.fillText(t, x, y); }
    var g = C.groups;
    lab(POLL[0].label, g[0].lx, g[0].ly);
    for (var q = 1; q <= 3; q++) lab(POLL[q].label, g[q].cx, g[q].cy + g[q].ry + (small ? 22 : 34));
    lab(POLL[4].label, g[4].x, g[4].y - (small ? 16 : 22));
  }
};

/* national restrictions, then a global moratorium */
var GROUPS = [22, 20, 18, 16, 14, 10];
SC.nations = {
  lay: function (S) {
    var R = S.R, cols = small ? 2 : 3, rows = Math.ceil(6 / cols), anchors = [];
    for (var g = 0; g < 6; g++) { var c = g % cols, r = Math.floor(g / cols); anchors.push({ x: R.x + R.w * (c + 0.5) / cols, y: R.y + R.h * (0.12 + 0.62 * (r + 0.5) / rows) }); }
    var shorts = anchors.map(function (a, g) { var len = Math.min(R.w / cols * 0.78, GROUPS[g] * (small ? 6.5 : 8.5)); return new Wire(a.x - len / 2, a.y + 14, a.x + len / 2, a.y + 14, 3); });
    var longs = rowsAt({ x: R.x, y: R.y, w: R.w, h: R.h }, 0.88, 26, 10);
    G.nat = { anchors: anchors, shorts: shorts, longs: longs, phase: -1, sa: 0, la: 0 };
  },
  member: function (i) { var acc = 0; for (var g = 0; g < 6; g++) { if (i < acc + GROUPS[g]) return [g, i - acc]; acc += GROUPS[g]; } return [5, 0]; },
  assign: function (phase, now) {
    var Nt = G.nat;
    for (var i = 0; i < N; i++) {
      var m = this.member(i), g = m[0], k = m[1], b = B[i];
      if (phase === 0) setTarget(b, { kind: 'seek', fast: false, x: Nt.anchors[g].x, y: Nt.anchors[g].y }, 0);
      else if (phase === 1) setTarget(b, perchOn(Nt.shorts[g], (k + 0.5) / GROUPS[g], k % 2 ? -1 : 1), rnd() * 300);
      else setTarget(b, perchSlot(Nt.longs, i, (i % 4) ? -1 : 1), (5 - g) * 70 + rnd() * 420);
    }
  },
  enter: function (S) { this.lay(S); G.nat.phase = -1; },
  frame: function (S, p, now) {
    if (S.relaid) {   // keep the phase and re-point the birds to the new wires: nobody takes off
      var ph = G.nat.phase; this.lay(S); G.nat.phase = ph;
      for (var r = 0; r < N; r++) { var tr = B[r].tg; if (!tr || !tr.wire) continue; if (ph === 1) tr.wire = G.nat.shorts[this.member(r)[0]]; else { var sl = slotIn(G.nat.longs, r); tr.wire = sl.wire; tr.t = sl.t; } }
    }
    var Nt = G.nat, phase = p < 0.08 ? 0 : p < 0.3 ? 1 : 2;
    if (reduced) phase = 2;
    if (phase !== Nt.phase) { Nt.phase = phase; this.assign(phase, now); }
    if (phase === 0) {
      for (var i = 0; i < N; i++) { var m = this.member(i), g = m[0], b = B[i], a = now * (0.0034 + g * 0.0005) * (g % 2 ? -1 : 1) + (m[1] / GROUPS[g]) * 6.283; b.tg.x = Nt.anchors[g].x + Math.cos(a) * (18 + (m[1] % 3) * 7); b.tg.y = Nt.anchors[g].y - 18 + Math.sin(a) * (8 + (m[1] % 3) * 4); b.tg.fast = true; }
    }
    Nt.sa = phase === 0 ? smooth((p + 0.02) / 0.06) : phase === 1 ? 1 : Math.max(0.25, 1 - smooth((p - 0.3) / 0.07));   // each nation's own line stays, faintly
    Nt.la = smooth((p - 0.26) / 0.07);
    if (reduced) { Nt.sa = 0.25; Nt.la = 1; }
  },
  back: function (S, col) { var Nt = G.nat; Nt.shorts.forEach(function (w) { strokeWire(w, col, 0.55 * Nt.sa); }); Nt.longs.forEach(function (w) { strokeWire(w, col, 0.55 * Nt.la); }); }
};

/* join: one place is empty until you take it */
var GAP = 81;
SC.join = {
  entry: 'fade',   // the wires come up already full, except one place
  lay: function (S) { G.join = anchorWires(G.join, rowsAt(S.R, 0.5, 34, 9, 10)); },
  slot: function (k) { return perchSlot(G.join, k, (k % 4) ? -1 : 1); },
  gapAt: function () { var sl = slotIn(G.join, GAP); return sl.wire.pt(sl.t); },
  enter: function (S) {
    G.join = null; this.lay(S); this.came = -1; this.t0 = performance.now();
    var k = 0;
    for (var i = 0; i < N - 1; i++) { if (k === GAP) k++; setTarget(B[i], this.slot(k), 0); k++; }
  },
  frame: function (S, p, now) {
    if (S.relaid) {   // new wires: everyone keeps their place, you included
      var was = G.join; this.lay(S);
      if (G.join !== was) { var k = 0; for (var i = 0; i < N - 1; i++) { if (k === GAP) k++; var sl = slotIn(G.join, k); if (B[i].tg && B[i].tg.wire) { B[i].tg.wire = sl.wire; B[i].tg.t = sl.t; } k++; } }
      var yb = B[N - 1]; if (this.came === 1 && yb.tg && yb.tg.wire) { var ys = slotIn(G.join, GAP); yb.tg.wire = ys.wire; yb.tg.t = ys.t; }
    }
    var you = B[N - 1], g = this.gapAt(), come = reduced ? 1 : (p > 0.24 && now - this.t0 > 900 ? 1 : 0);
    if (reduced && this.came === 1 && you.tg && you.tg.kind === 'pin') { you.tg.x = g.x + 24; you.tg.y = g.y - 26; }
    if (come !== this.came) {
      this.came = come;
      if (reduced) { you.hidden = false; setTarget(you, { kind: 'pin', x: g.x + 24, y: g.y - 26, ang: 0.35 }, 0); }   // the still: one empty place, and the bird about to take it
      else if (come) {
        var tr = 0; Array.prototype.forEach.call(S.el.querySelectorAll('.cap .pull'), function (e) { tr = Math.max(tr, e.getBoundingClientRect().right); });
        var yt = this.slot(GAP); yt.v = 3.4; yt.dir = -1; yt.from = small ? 'right' : 'below'; yt.minx = tr + 40; setTarget(you, yt, 0);   // you come up from where you are reading
      }
      else setTarget(you, { kind: 'away', x: W + 120, y: g.y }, 0);
    }
  },
  back: function (S, col) {
    G.join.forEach(function (w) { strokeWire(w, col, 0.55); });
    var you = B[N - 1], g = this.gapAt(), ur = small ? 2.3 : 2.7;
    if (!(you.st === 'perched' && !you.hidden)) { ctx.strokeStyle = rgba(inkAt(curM, g.y), 0.8); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(g.x, g.y - ur - 0.6, ur, 0, 6.283); ctx.stroke(); }   // your place, empty
  }
};

/* July: the test did not hold. Birds kept inside a box find a gap, and go into another box. */
SC.breach = {
  entry: 'fade',
  geom: function (S) {
    var R = S.R, w = R.w * (small ? 0.4 : 0.3), h = Math.min(R.h * 0.62, w * (small ? 1.25 : 0.78)), y = R.y + (R.h - h) / 2 - (small ? 6 : 10);
    var A = { x: R.x + R.w * (small ? 0.02 : 0.08), y: y, w: w, h: h }, Bx = { x: R.x + R.w * (small ? 0.58 : 0.62), y: y, w: w, h: h };
    return { A: A, B: Bx, gapA: { x: A.x + A.w, y: A.y + A.h * 0.5 }, gapB: { x: Bx.x, y: Bx.y + Bx.h * 0.5 } };
  },
  inA: function (i) { return { kind: 'roam', box: this.inner(G.br.A), speed: 1.9 }; },
  inner: function (bx) { return { x: bx.x + 8, y: bx.y + 8, w: bx.w - 16, h: bx.h - 16 }; },
  enter: function (S) {
    G.br = this.geom(S); G.br.open = 0; G.br.broken = 0; this.out = [];
    for (var i = 0; i < N; i++) {
      this.out[i] = false; setTarget(B[i], this.inA(i), 0);
    }
  },
  frame: function (S, p, now) {
    if (S.relaid) { var g = this.geom(S); G.br.A = g.A; G.br.B = g.B; G.br.gapA = g.gapA; G.br.gapB = g.gapB; for (var r = 0; r < N; r++) { var t = B[r].tg; if (t && t.kind === 'roam') t.box = this.inner(this.out[r] ? G.br.B : G.br.A); } }
    var Gb = G.br; Gb.open = reduced ? 1 : smooth((p - 0.14) / 0.08); Gb.inB = reduced ? 1 : smooth((p - 0.2) / 0.06); Gb.broken = reduced ? 1 : smooth((p - 0.36) / 0.1);
    for (var i = 0; i < N; i++) {
      var b = B[i], goes = b.rank < 0.62, th = 0.2 + 0.3 * (b.rank / 0.62), out = goes && (reduced || p > th);
      if (out !== this.out[i]) {
        this.out[i] = out;
        if (out) setTarget(b, { kind: 'path', i: 0, pts: [{ x: Gb.gapA.x - 10, y: Gb.gapA.y }, { x: Gb.gapA.x + 16, y: Gb.gapA.y }, { x: Gb.gapB.x - 10, y: Gb.gapB.y + (rnd() - 0.5) * 20 }, { x: Gb.gapB.x + 14, y: Gb.gapB.y }], then: { kind: 'roam', box: this.inner(Gb.B), speed: 2.5 } }, 0);
        else setTarget(b, { kind: 'path', i: 0, pts: [{ x: Gb.gapB.x + 12, y: Gb.gapB.y }, { x: Gb.gapA.x - 14, y: Gb.gapA.y }], then: this.inA(i) }, 0);
      }
    }
  },
  back: function (S, col) {
    var Gb = G.br, gap = 22 * Gb.open;
    function box(bx, gx, side, dashed, a) {
      ctx.strokeStyle = rgba(inkAt(curM, bx.y + bx.h / 2), a); ctx.lineWidth = 1.4; ctx.setLineDash(dashed ? [5, 6] : []);
      ctx.beginPath();
      if (side === 'right') { ctx.moveTo(bx.x + bx.w, bx.y + bx.h / 2 - gx); ctx.lineTo(bx.x + bx.w, bx.y); ctx.lineTo(bx.x, bx.y); ctx.lineTo(bx.x, bx.y + bx.h); ctx.lineTo(bx.x + bx.w, bx.y + bx.h); ctx.lineTo(bx.x + bx.w, bx.y + bx.h / 2 + gx); }
      else { ctx.moveTo(bx.x, bx.y + bx.h / 2 + gx); ctx.lineTo(bx.x, bx.y + bx.h); ctx.lineTo(bx.x + bx.w, bx.y + bx.h); ctx.lineTo(bx.x + bx.w, bx.y); ctx.lineTo(bx.x, bx.y); ctx.lineTo(bx.x, bx.y + bx.h / 2 - gx); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    box(Gb.A, gap, 'right', false, 0.75);
    box(Gb.B, 22 * Gb.inB, 'left', Gb.broken > 0.5, 0.75);
    ctx.font = small ? '600 13px "Alegreya Sans", sans-serif' : labelFont; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = rgba(inkAt(curM, Gb.A.y + Gb.A.h + 28), 0.9);
    ctx.fillText('the test at OpenAI', Gb.A.x + Gb.A.w / 2, Gb.A.y + Gb.A.h + 28);
    ctx.fillText(small ? 'Hugging Face' : 'Hugging Face’s computers', Gb.B.x + Gb.B.w / 2, Gb.B.y + Gb.B.h + 28);
  }
};

/* We've done it before: one wire per agreement, drawn where the page lists it; each fills as you reach it; the open row (AI) last */
var PREC_PER = [12, 12, 12, 12, 12, 12, 12, 16];
SC.prec = {
  rows: function () { return Array.prototype.slice.call(document.querySelectorAll('.prec .perch')); },
  enter: function (S) { for (var i = 0; i < N; i++) { B[i].hidden = true; B[i].tg = null; } G.prec = { on: [], t: [] }; },
  done: function () { return !this.rows().some(function (e, r) { var q = e.getBoundingClientRect(); return G.prec && G.prec.on[r] && q.bottom > 0 && q.top < H; }); },   // none of its lines on screen
  frame: function (S, p, now) {
    var els = this.rows(), Gp = G.prec;
    for (var r = 0; r < els.length; r++) {
      var q = els[r].getBoundingClientRect(), last = r === els.length - 1, was = Gp.on[r];
      var on = reduced ? true : q.top < H * (last ? 0.66 : 0.84) ? true : q.top > H * 0.95 ? false : !!was;
      if (on !== was) { Gp.on[r] = on; Gp.t[r] = now; var li = els[r].closest('li'); if (li) li.classList.toggle('landed', on); }
    }
  },
  back: function (S, col) {
    var els = this.rows(), Gp = G.prec, t = performance.now();
    for (var r = 0; r < els.length; r++) {
      if (!Gp.on[r]) continue;
      var q = els[r].getBoundingClientRect(); if (q.bottom < -40 || q.top > H + 40) continue;
      var last = r === els.length - 1, u = reduced ? 1 : smooth((t - (Gp.t[r] || 0)) / 700), y = q.top + q.height * 0.6 + (ctx.getTransform().f ? 0 : 0);
      ctx.strokeStyle = rgba(inkAt(curM, y), last ? 0.55 : 0.75); ctx.lineWidth = last ? 1.2 : 1.8;
      if (last) ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(q.left, y); ctx.lineTo(q.left + (q.right - q.left) * u, y); ctx.stroke();   // a line, drawn
      ctx.setLineDash([]);
    }
  }
};

/* the end: no race; the flock flies together, in formation, toward the light */
SC.together = {
  entry: 'fade',
  enter: function (S) { for (var i = 0; i < N; i++) { B[i].hidden = true; B[i].tg = null; } },
  frame: function (S, p) { this.p = reduced ? 0.8 : p; },
  back: function (S, col) {
    var R = S.R, p = this.p || 0, k = small ? 5 : 7, rr = mulberry(7), stopX = R.x + R.w * 0.62, y0 = R.y + R.h * 0.18, y1 = R.y + R.h * 0.86;
    var lineU = smooth((p - 0.3) / 0.14), halt = smooth((p - 0.42) / 0.2), r = small ? 3 : 3.6;
    for (var i = 0; i < k; i++) {
      var y = lerp(y0, y1, i / (k - 1)), v = 0.55 + 0.45 * rr();
      var raceX = R.x + R.w * (0.04 + 0.52 * v * smooth(p / 0.42)), x = lerp(raceX, stopX - r - 3, halt);
      ctx.strokeStyle = rgba(col, 0.2); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(R.x - 20, y); ctx.lineTo(R.x + R.w + 20, y); ctx.stroke();   // a track each
      ctx.strokeStyle = rgba(col, 0.5 * (1 - halt)); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(Math.max(R.x, x - 60 * v), y); ctx.lineTo(x, y); ctx.stroke();   // racing
      ctx.fillStyle = rgba(col, 0.9); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
    if (lineU > 0) { ctx.strokeStyle = rgba(col, 0.85); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(stopX, y0 - 22); ctx.lineTo(stopX, lerp(y0 - 22, y1 + 22, lineU)); ctx.stroke(); }   // one line, for all of them
  }
};

/* ---------- the loop ----------
   A section either has a picture (its scene) or is empty ('none'): reading happens under an empty sky.
   A picture belongs to its section. When reading moves on, it keeps playing and rides away with its
   caption (or with what it is drawn on), like a figure in an article; its birds are put away only once
   it has left the screen. A new picture starts when its section reaches the middle of the screen and
   nothing else is still on screen. Birds fly in from the right; scrolling back up, a jump (a link,
   a fling, the technical section opening) and reduced motion place a picture as it stands instead. */
var cur = { name: 'none', el: null, key: '', leaving: false, lt0: 0, fade0: -1e9 };
var lastT = 0, scrollPrev = window.scrollY, lastDy = 0, jumpUntil = 0, jumpT0 = -1e9, jumpMoved = false, calm = 0, afterJump = false, firstFrame = true;
var STILL = { highway: 0.46, together: 0.8, grown: 1 };   // highway: the plan through the town, the levelling just short of it   // reduced motion: the frame that says it
function sceneFor(s) {
  if (s.inter && s.cap && s.cap._nopic) return 'none';   // no room for its picture on this screen
  if (s.inter || s.hero) return s.scene;
  if (!wide && s.el.getAttribute('data-mobile') !== 'on') return 'none';
  return s.scene;
}
var barEl = document.getElementById('bar'), barKey = '';
function tintBar(M) {
  if (!barEl) return;
  var c = skyAt(M, 0.02), dark = lum(c) < 0.2, k = Math.round(c[0] / 3) + ',' + Math.round(c[1] / 3) + ',' + Math.round(c[2] / 3) + (dark ? 'd' : 'l');
  if (k === barKey) return; barKey = k;
  barEl.style.setProperty('--barbg', rgba(c, 0.78)); barEl.setAttribute('data-on', dark ? 'dark' : 'light');
}
function regionKey(R) { return R ? [Math.round(R.x), Math.round(R.y), Math.round(R.w), Math.round(R.h)].join(',') : 'none'; }
function progress(s) {   // counted from the caption: a picture interlude's top padding is its picture riding in
  var pad = s.el._pad || 0;
  return clamp((H * 0.5 - (s.r.top + pad)) / Math.max(1, s.r.height - pad), 0, 1);
}
function sceneNow(now) { return reduced ? 0 : now; }   // reduced motion: every still is the same moment
function sceneP(s, name) { return reduced && s.inter ? (STILL[name] != null ? STILL[name] : 1) : progress(s); }
function riseOf(s) { return s.inter && s.cap ? capStuckRect(s).top - s.cap.getBoundingClientRect().top : 0; }   // how far the caption is from where it pins
function sceneState(s, name, now) {
  var R = regionFor(s) || { x: W * 0.05, y: H * 0.1, w: W * 0.9, h: H * 0.5 };
  return { R: R, hero: s.hero, el: s.el, p: sceneP(s, name), relaid: false, leaving: cur.leaving, lt: now - cur.lt0 };
}
function putAway() {
  for (var i = 0; i < N; i++) { var b = B[i]; b.hidden = true; b.st = 'fly'; b.tg = null; b.delay = 0; b.pendingLift = false; b.trail.length = 0; }
  cur.name = 'none'; cur.el = null; cur.leaving = false;
}
function birdsOnScreen(rise, r) {   // only where the picture can be drawn: its section's visible part
  var y0 = Math.max(0, r.top) - 12, y1 = Math.min(H, r.bottom) + 12; if (y1 - y0 <= 24) return false;
  for (var i = 0; i < N; i++) { var b = B[i]; if (b.hidden) continue; var y = b.y - rise; if (y > y0 && y < y1 && b.x > -40 && b.x < W + 40) return true; }
  return false;
}
function armJump(ms) { var t = performance.now(); jumpUntil = Math.max(jumpUntil, t + ms); jumpT0 = t; jumpMoved = false; }
function start(s, name, now, placed, calmStart) {
  cur.name = name; cur.el = s.el; cur.leaving = false;
  var S = sceneState(s, name, now); S.placed = placed; cur.key = regionKey(S.R);
  for (var i = 0; i < N; i++) { var b = B[i]; b.hidden = true; b.st = 'fly'; b.tg = null; b.delay = 0; b.vx = b.vy = 0; b.trail.length = 0; b.morph = name === 'grown' ? 0 : 1; b.depth = 0; b.fs = b.fs0; b.sc = 1; }
  F.obs = obstaclesFor(s);
  entering = true; SC[name].enter(S); entering = false;
  var fade = SC[name].entry === 'fade';
  if (placed || fade || reduced) { SC[name].frame(S, S.p, sceneNow(now)); snapAll(); }
  cur.fade0 = !reduced && ((fade && !placed) || (placed && calmStart)) ? now : -1e9;   // a picture placed while the page is still fades in
}

function frame(now) {
  var dt = lastT ? clamp((now - lastT) / 16.67, 0.25, 2.5) : 1; lastT = now;
  var sy = window.scrollY, dy = sy - scrollPrev; scrollPrev = sy; if (dy) lastDy = dy;
  calm = dy === 0 ? calm + 1 : 0;
  if (Math.abs(dy) > H * 0.3) { if (jumpUntil <= now) jumpT0 = now; jumpUntil = Math.max(jumpUntil, now + 250); }   // a jump or a hard fling: nothing flies in
  if (jumpUntil > now) {
    if (dy !== 0) { jumpMoved = true; if (now - jumpT0 < 1800) jumpUntil = Math.max(jumpUntil, now + 160); }   // the jump's own smooth scroll
    else if (jumpMoved && calm >= 3) jumpUntil = now;   // it has landed: what moves next is the reader
  }
  var jumping = jumpUntil > now;
  if (jumping) afterJump = true;
  var list = readSections(); if (!list.length) return;
  var ai = activeIndex(list), s = list[ai];
  s.p = reduced && s.inter ? 1 : progress(s);
  s.mp = reduced && s.inter ? 1 : clamp((H * 0.5 - s.r.top) / Math.max(1, s.r.height), 0, 1);
  var M = moodNow(list, ai);
  // the picture wanted now: the reading section's, or the next one's as it comes up the screen
  var ws = null, want = 'none', w0 = sceneFor(s);
  if (w0 !== 'none') { ws = s; want = w0; }
  else { var nx = list[ai + 1]; if (nx && nx.r.top < H * 0.85) { var w1 = sceneFor(nx); if (w1 !== 'none') { ws = nx; want = w1; } } }

  // the picture on screen, and the section it belongs to
  var ps = null;
  if (cur.el) for (var q = 0; q < list.length; q++) if (list[q].el === cur.el) { ps = list[q]; break; }
  if (cur.name !== 'none' && !ps) putAway();   // its section is gone (the technical part closed)
  if (cur.name !== 'none') {
    if (ws && ws.el === cur.el) cur.leaving = false;   // back with its own section: carry on, no replay
    else if (jumping) putAway();
    else if (!cur.leaving) { cur.leaving = true; cur.lt0 = now; }
  }
  if (cur.name !== 'none' && cur.leaving) {   // put away once nothing of it can be seen
    var r0 = ps.el.getBoundingClientRect(), rs0 = riseOf(ps), S0 = sceneState(ps, cur.name, now);
    var off = r0.bottom < -20 || r0.top > H + 20, above = ps.inter && S0.R.y + S0.R.h - rs0 < 0;
    if (off || ((above || (SC[cur.name].done && SC[cur.name].done(S0))) && !birdsOnScreen(rs0, r0))) putAway();
  }
  if (cur.name === 'none' && want !== 'none' && (!jumping || reduced)) {   // reduced motion places every picture anyway
    var placed = reduced || afterJump || lastDy < 0 || (firstFrame && !(ws.hero && sy < 8));   // only the first screen, opened at the top, flies in on load
    start(ws, want, now, placed, dy === 0);
  }
  if (!jumping) afterJump = false;
  firstFrame = false;

  var rise = 0, S = null, cs = null;
  if (cur.name !== 'none') {
    cs = cur.leaving ? ps : ws;
    S = sceneState(cs, cur.name, now);
    var key = regionKey(S.R);
    if (key !== cur.key) { cur.key = key; S.relaid = true; F.obs = obstaclesFor(cs); }
    rise = riseOf(cs);
    SC[cur.name].frame(S, S.p, sceneNow(now));
    if (jumping && !cur.leaving && !reduced) snapAll();   // mid-jump, whatever its section adds is placed, not flown in
  }

  // captions take the colour the sky allows: every caption on or near the screen, where it is now
  for (var ci = 0; ci < list.length; ci++) {
    var cl = list[ci]; if (!cl.inter || !cl.cap || cl.r.top > H * 1.5 || cl.r.bottom < -H * 0.5) continue;
    var cr = ci === ai ? capStuckRect(cl) : cl.cap.getBoundingClientRect(), on = onDark(M, clamp((cr.top + cr.bottom) / 2 / H, 0, 1)) ? 'dark' : 'light';
    if (cl.cap.getAttribute('data-on') !== on) cl.cap.setAttribute('data-on', on);
  }

  if (S) { flockCentre(); if (!reduced) for (var j = 0; j < N; j++) stepBird(B[j], dt); else snapAll(); }

  drawSky(M, now); curM = M; tintBar(M);
  if (!S) return;
  var dark2 = onDark(M, 0.5), lineCol = dark2 ? [214, 222, 234] : INK, sc0 = SC[cur.name];
  var GA = clamp((now - cur.fade0) / 420, 0, 1) * (sc0.alpha ? clamp(sc0.alpha(S), 0, 1) : 1);
  if (GA <= 0.004) return;
  // a picture stays inside its own section: it never draws over the text before or after it, and where
  // the section's edge is on screen the picture comes out from behind that text with a soft edge
  var sr = cs.el.getBoundingClientRect(), ct = Math.max(0, sr.top), cb = Math.min(H, sr.bottom), SOFT = 40;
  if (cb - ct < 1) return;
  var edged = sr.top > 0 || sr.bottom < H;
  if (edged) { ctx = lctx; ctx.clearRect(0, 0, W, H); }
  ctx.save(); ctx.beginPath(); ctx.rect(0, ct, W, cb - ct); ctx.clip(); ctx.translate(0, -rise); ctx.globalAlpha = GA;
  if (sc0.back) sc0.back(S, lineCol);
  var s0 = small ? 1.2 : 1.42, UNIT = small ? 2.3 : 2.7;
  for (var k = 0; k < N; k++) {
    var b = B[k]; if (b.hidden) continue;
    var birdCol = rgba(inkAt(M, b.y - rise));
    var sc = s0 * (b.sc || 1) * (1 + (b.depth || 0) * 0.22);
    // every member of a picture is a plain mark, a unit: a person, a copy of an AI, a country's share; never a bird
    var ur = UNIT * sc / s0;
    if (b.st === 'perched') { ctx.fillStyle = birdCol; ctx.beginPath(); ctx.arc(b.x, b.y - ur - 0.6, ur, 0, 6.283); ctx.fill(); }
    else {
      if (b.trail.length > 2) { ctx.strokeStyle = birdCol; ctx.globalAlpha = GA * 0.22; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(b.trail[0], b.trail[1]); for (var tt = 2; tt < b.trail.length; tt += 2) ctx.lineTo(b.trail[tt], b.trail[tt + 1]); ctx.stroke(); ctx.globalAlpha = GA; }
      ctx.fillStyle = birdCol; ctx.beginPath(); ctx.arc(b.x, b.y, ur, 0, 6.283); ctx.fill();
    }
  }
  if (sc0.front) sc0.front(S, lineCol);
  ctx.restore();
  if (edged) {
    ctx.globalCompositeOperation = 'destination-out';
    var gr;
    if (sr.top > 0) { gr = ctx.createLinearGradient(0, ct, 0, ct + SOFT); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, ct, W, SOFT); }
    if (sr.bottom < H) { gr = ctx.createLinearGradient(0, cb - SOFT, 0, cb); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); ctx.fillStyle = gr; ctx.fillRect(0, cb - SOFT, W, SOFT); }
    ctx.globalCompositeOperation = 'source-over';
    ctx = sky; ctx.drawImage(layer, 0, 0, W, H);
  }
}
function obstaclesFor(s) {
  var out = [], els = s.cap ? [s.cap] : [];
  for (var i = 0; i < els.length; i++) { var r = els[i].getBoundingClientRect(); if (!r.height) continue; out.push({ x: r.left - 22, y: r.top - 22, w: r.width + 44, h: r.height + 44 }); }
  if (s.inter && s.cap) { var c = capStuckRect(s); out = [{ x: 0, y: c.top - 26, w: W, h: c.bottom - c.top + 52 }]; }
  return out;
}
/* reduced motion: no flight, just the picture */
function snapAll() {
  for (var i = 0; i < N; i++) {
    var b = B[i], tg = b.tg; if (!tg) continue;
    if (tg.kind === 'away' || tg.kind === 'hide') { b.hidden = true; continue; }
    b.delay = 0; b.pendingLift = false;   // a placed bird has nothing left to wait for
    if (tg.kind === 'free') { if (b.fx == null) { b.fx = rnd(); b.fy = rnd(); } b.x = F.R.x + F.R.w * (0.15 + 0.7 * b.fx); b.y = F.R.y + F.R.h * (0.2 + 0.6 * b.fy); b.st = 'fly'; b.ph = 1.2; b.hidden = false; b.sc = F.sc; continue; }
    if (tg.kind === 'path') { b.tg = tg = tg.then; }
    if (tg.kind === 'roam') { if (b.fx == null) { b.fx = rnd(); b.fy = rnd(); } b.x = tg.box.x + tg.box.w * (0.1 + 0.8 * b.fx); b.y = tg.box.y + tg.box.h * (0.1 + 0.8 * b.fy); b.st = 'fly'; b.ph = 1.2; b.hidden = false; continue; }
    if (tg.wire) { var p = tg.wire.pt(tg.t); b.x = p.x; b.y = p.y; b.vx = b.vy = 0; b.st = 'perched'; b.dir = tg.dir || 1; b.hidden = false; continue; }
    b.x = tg.x; b.y = tg.y; b.vx = b.vy = 0; b.st = tg.kind === 'perch' ? 'perched' : 'fly'; b.hidden = false; if (tg.ang != null) b.ang = tg.ang;
  }
}

function resize() {
  W = window.innerWidth; H = window.innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  layer.width = cv.width; layer.height = cv.height; lctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  wide = W >= 1000; small = W < 700;
}
var raf = 0;
function safe(now) { try { frame(now); } catch (e) { ctx = sky; if (!safe.told) { safe.told = true; if (window.console) console.error(e); } } }   // one bad frame must not freeze the birds for good
function loop(now) { raf = 0; if (!document.hidden) safe(now); raf = requestAnimationFrame(loop); }
function still() { if (!raf) raf = requestAnimationFrame(function (t) { raf = 0; safe(t); }); }

document.documentElement.classList.add('sky');
resize();
for (var hb = 0; hb < N; hb++) B[hb].hidden = true;   // nobody is on screen until a picture brings them
fitCaps();
window.addEventListener('resize', function () { resize(); fitCaps(); cur.key = ''; if (reduced) still(); });
if (document.fonts) document.fonts.ready.then(function () { fitCaps(); cur.key = ''; if (reduced) still(); });
if (window.ResizeObserver) { var ro = new ResizeObserver(function () { fitCaps(); cur.key = ''; if (reduced) still(); }); caps.forEach(function (c) { ro.observe(c); }); }
var tech = document.getElementById('technical'); if (tech) tech.addEventListener('toggle', function () { fitCaps(); cur.key = ''; armJump(400); if (reduced) still(); });
document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href^="#"]'); if (a) armJump(450); }, true);   // a link: no stream of birds across the page
window.addEventListener('hashchange', function () { armJump(450); });
if (reduced) { window.addEventListener('scroll', still, { passive: true }); still(); if (document.fonts) document.fonts.ready.then(still); }
else raf = requestAnimationFrame(loop);
window.__flock = { B: B, cur: cur };
})();
