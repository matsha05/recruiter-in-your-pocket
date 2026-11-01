// The three directions: symbols, lockups, and files. Units: text set at 100 units = font size.
const { C, setRuns, metric, rrect, poly, rectCCW, svgDoc, r2 } = require('./lib.cjs');

const P = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const chisel = (x0, y0, x1, y1, s) => poly([[x0 + s, y0], [x1, y0], [x1 - s, y1], [x0, y1]]);
const CAP = metric('sx', 'cap') * 100; // 70.3
const TRACK = -0.015;
const SPACE = 0.17;
const LEAD = 100; // stacked baseline-to-baseline
// optical word spacing (thousandths of an em): the r's arm and the Y's open diagonal make those gaps look wider
const KADJ = { 'r ': -10, ' Y': -16 };

/* ---------------- A. The Marked Line ---------------- */
const A = {
  key: 'a-marked-line',
  name: 'The Marked Line',
  rationale: [
    'The symbol is the product: a resume sheet with the one line a recruiter would miss swiped in highlighter, so the logo teaches what the yellow means before the report does.',
    'It is the most literal of the three and the closest to the wedge, and it puts the highlighter on every page, which is also its cost.',
  ],
  bends: [
    'At 16 px the sheet keeps its outline, two plain lines and the marked line, redrawn on whole pixels: 1 px outline, 2 px lines, 1 px gaps.',
    'On the report page the header symbol puts a second yellow mark beside the Critical Miss. That breaks the one-highlighter-per-view rule unless report pages show the name without the symbol.',
    'Printed in grayscale the highlight turns pale gray and the sheet still reads.',
  ],
  inkBox: [5, 1, 27, 31],
  symbol(mode = 'light') {
    const dark = mode === 'dark';
    const parts = [];
    if (dark) parts.push(P(rrect(5, 1, 22, 30, 3.25), C.paper));
    else parts.push(P(rrect(5, 1, 22, 30, 3.25), C.ink), P(rrect(7.25, 3.25, 17.5, 25.5, 1.25), C.paper));
    parts.push(
      P('M10 7.5h12v3h-12z', C.ink),
      P(chisel(8.5, 12.75, 24.75, 19.25, 1.75), C.hl),
      P('M10 14.5h12.5v3h-12.5z', C.ink),
      P('M10 21.5h7.5v3h-7.5z', C.ink),
    );
    return parts.join('');
  },
  // hand-placed on the 16 px grid
  fav16() {
    return [
      P(rrect(2, 0, 12, 16, 2), C.ink),
      P(rrect(3, 1, 10, 14, 1), C.paper),
      P('M5 3h6v2h-6z', C.ink),
      P(chisel(4, 6, 13, 10, 1), C.hl),
      P('M5 7h6.5v2h-6.5z', C.ink),
      P('M5 11h4v2h-4z', C.ink),
    ].join('');
  },
  // 32 px: same drawing snapped to whole pixels (2 px outline, 3 px lines)
  fav32() {
    return [
      P(rrect(5, 1, 22, 30, 3), C.ink),
      P(rrect(7, 3, 18, 26, 1.25), C.paper),
      P('M10 7h12v3h-12z', C.ink),
      P(chisel(8.5, 12, 24.5, 19, 1.5), C.hl),
      P('M10 14h12.5v3h-12.5z', C.ink),
      P('M10 21h7.5v3h-7.5z', C.ink),
    ].join('');
  },
  app() {
    const s = 180 / 32, g = (v) => r2(v * s);
    return [
      P(rrect(0, 0, 180, 180, 0), C.ink),
      P(rrect(g(6.75), g(3.25), g(18.5), g(25.5), g(1.25)), C.paper),
      P(rrect(g(9.75), g(7.75), g(11), g(2.6), 0), C.ink),
      P(chisel(g(8.4), g(12.4), g(24), g(18.4), g(1.5)), C.hl),
      P(rrect(g(9.75), g(14.1), g(11.75), g(2.6), 0), C.ink),
      P(rrect(g(9.75), g(20.75), g(7.25), g(2.6), 0), C.ink),
    ].join('');
  },
  one: { symH: 1.9 * CAP, gap: 34 },
  stack: { gap: 34 },
};

/* ---------------- B. The Pocket Pen ---------------- */
// pocket body with the clip channel cut out, so the pen reads on any background
// polygon with each corner rounded by a quadratic curve of the given reach
function roundPoly(pts) {
  const n = pts.length, seg = [];
  const at = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [a[0] + dx / l * d, a[1] + dy / l * d]; };
  for (let i = 0; i < n; i++) {
    const p = pts[i], prev = pts[(i + n - 1) % n], next = pts[(i + 1) % n], r = p[2] || 0;
    const a = at(p, prev, r), b = at(p, next, r);
    seg.push((i ? 'L' : 'M') + r2(a[0]) + ' ' + r2(a[1]) + (r ? `Q${r2(p[0])} ${r2(p[1])} ${r2(b[0])} ${r2(b[1])}` : ''));
  }
  return seg.join('') + 'Z';
}
// a shirt pocket: flat sewn top, straight sides, a shallow point at the bottom
function pocket({ x0, x1, y0, ySide, yTip, rs, rt, chx0, chx1, chy1, chr }) {
  const cx = (x0 + x1) / 2;
  const body = roundPoly([[x0, y0, 0.6], [x1, y0, 0.6], [x1, ySide, rs], [cx, yTip, rt], [x0, ySide, rs]]);
  const channel = `M${r2(chx0)} ${r2(y0)}V${r2(chy1 - chr)}A${chr} ${chr} 0 0 0 ${r2(chx1)} ${r2(chy1 - chr)}V${r2(y0)}Z`;
  return body + channel;
}
function penCap(x0, w, top, bottom, r) {
  return `M${r2(x0)} ${r2(bottom)}V${r2(top + r)}A${r} ${r} 0 0 1 ${r2(x0 + r)} ${r2(top)}H${r2(x0 + w - r)}A${r} ${r} 0 0 1 ${r2(x0 + w)} ${r2(top + r)}V${r2(bottom)}Z`;
}
const B = {
  key: 'b-pocket-pen',
  name: 'The Pocket Pen',
  rationale: [
    'The name, drawn: the recruiter\'s green pen clipped in your shirt pocket, the tool a recruiter always has on them, and now so do you.',
    'It spends no yellow, explains the name at a glance, and gives the favicon a silhouette nobody in the category owns; it is the most charming of the three and the least literal about what the product does.',
  ],
  bends: [
    'At 16 px the pocket becomes a 12 by 10 px shield-like shape and the pen a 4 px cap with a 2 px clip, cut out of the pocket with 1 px gaps on whole pixels.',
    'On dark browser chrome the favicon switches to a light pocket and the mint dark-mode pen through a color-scheme query in the SVG; the home screen icon sits on a paper tile, where the green pen is strongest.',
    'Without the pen the pocket alone reads as a badge or a shield, which is generic. The clip over the edge is what makes it a pen in a pocket, so the two are never separated.',
  ],
  inkBox: [5, 2, 27, 30.5],
  pocketMid: 19.5, // optical center of the pocket body on the 32 grid (the point carries little weight) // vertical center of the pocket body on the 32 grid
  symbol(mode = 'light') {
    const dark = mode === 'dark';
    const ink = dark ? C.dFg : C.ink, pen = dark ? C.dPen : C.pen;
    return [
      P(pocket({ x0: 5, x1: 27, y0: 10, ySide: 25, yTip: 30.5, rs: 2.5, rt: 3, chx0: 16.5, chx1: 23.5, chy1: 25, chr: 3.5 }), ink),
      P(penCap(16.5, 7, 2, 10, 2.5), pen),
      P(rrect(18.5, 7, 3, 16, [0, 0, 1.5, 1.5]), pen),
    ].join('');
  },
  fav16(mode = 'light') {
    const dark = mode === 'dark';
    const ink = dark ? C.dFg : C.ink, pen = dark ? C.dPen : C.pen;
    return [
      P(pocket({ x0: 2, x1: 14, y0: 5, ySide: 12, yTip: 15, rs: 1.25, rt: 1.5, chx0: 8, chx1: 12, chy1: 12, chr: 2 }), ink),
      P(penCap(8, 4, 1, 5, 1.5), pen),
      P(rrect(9, 4, 2, 7, [0, 0, 1, 1]), pen),
    ].join('');
  },
  // 32 px: snapped to whole pixels
  fav32(mode = 'light') {
    const dark = mode === 'dark';
    const ink = dark ? C.dFg : C.ink, pen = dark ? C.dPen : C.pen;
    return [
      P(pocket({ x0: 5, x1: 27, y0: 10, ySide: 25, yTip: 30.5, rs: 2.5, rt: 3, chx0: 16, chx1: 23, chy1: 25, chr: 3.5 }), ink),
      P(penCap(16, 7, 2, 10, 2.5), pen),
      P(rrect(18, 7, 3, 16, [0, 0, 1.5, 1.5]), pen),
    ].join('');
  },
  app() {
    // paper tile, ink pocket, green pen
    const s = 116 / 28.5;
    return P(rrect(0, 0, 180, 180, 0), C.paper) + `<g transform="translate(${r2(90 - 16 * s)} ${r2(92 - 16.25 * s)}) scale(${r2(s)})">${this.symbol('light')}</g>`;
  },
  one: { symH: 1.9 * CAP, gap: 30, alignPocket: true },
  stack: { gap: 30 },
};

/* ---------------- C. Two Voices ---------------- */
const C_ = {
  key: 'c-two-voices',
  name: 'Two Voices',
  rationale: [
    'The name is the logo: Schibsted for the product, and a Literata italic "in" in the green pen, the same two voices as every report, so a long name reads as two easy halves.',
    'It is the quietest change and the safest at every size; the favicon falls back to a plain R, which is honest but the least distinctive symbol here.',
  ],
  bends: [
    'The Literata italic "in" is the thinnest stroke in any direction. It still reads at 13 px but turns faint at 12 px on a standard screen, so emails and footers should stay at 14 px or larger.',
    'A favicon cannot carry two voices at 16 px, so the symbol is a plain R in Schibsted ExtraBold on an ink tile. It is legible everywhere and says nothing on its own.',
    'In grayscale the green "in" turns dark gray and the two halves still separate, because the change of typeface does the work, not the color.',
  ],
  noSymbolInLockup: true,
  rTile(n, { radius, capFrac, fg = C.ground, bg = C.ink }) {
    const cap = n * capFrac;
    const size = cap / (CAP / 100);
    const t = setRuns([{ text: 'R', font: 'sx', size, fill: fg }]);
    const w = t.bbox.x1 - t.bbox.x0;
    const dx = (n - w) / 2 - t.bbox.x0 + n * 0.012;
    const dy = (n + cap) / 2;
    return P(rrect(0, 0, n, n, radius), bg) + `<g transform="translate(${r2(dx)} ${r2(dy)})">${t.paths.map((p) => P(p.d, p.fill)).join('')}</g>`;
  },
  symbol() { return this.rTile(32, { radius: 7, capFrac: 0.58 }); },
  fav16() { return this.rTile(16, { radius: 3.5, capFrac: 0.66 }); },
  fav32() { return this.symbol(); },
  app() { return this.rTile(180, { radius: 0, capFrac: 0.56 }); },
};

/* ---------------- lockups ---------------- */
function nameRuns(dir, mode, line) {
  const ink = mode === 'dark' ? C.dFg : C.ink;
  const pen = mode === 'dark' ? C.dPen : C.pen;
  const base = { font: 'sx', size: 100, fill: ink, tracking: TRACK };
  if (dir === C_) {
    const inRun = { text: 'in', font: 'li', size: 108, fill: pen };
    if (line === 'one') return [{ ...base, text: 'Recruiter' }, { ...inRun, dx: 13 }, { ...base, text: 'Your Pocket', dx: 17 }];
    if (line === 1) return [{ ...base, text: 'Recruiter' }];
    return [{ ...inRun }, { ...base, text: 'Your Pocket', dx: 17 }];
  }
  if (line === 'one') return [{ ...base, text: 'Recruiter in Your Pocket' }];
  if (line === 1) return [{ ...base, text: 'Recruiter' }];
  return [{ ...base, text: 'in Your Pocket' }];
}

function symbolGroup(dir, mode, x, top, h) {
  const [bx0, by0, bx1, by1] = dir.inkBox;
  const s = h / (by1 - by0);
  return { svg: `<g transform="translate(${r2(x - bx0 * s)} ${r2(top - by0 * s)}) scale(${r2(s)})">${dir.symbol(mode)}</g>`, w: (bx1 - bx0) * s, h };
}

function textGroup(t, dx = 0, dy = 0) {
  return `<g transform="translate(${r2(dx)} ${r2(dy)})">${t.paths.map((p) => P(p.d, p.fill)).join('')}</g>`;
}

function lockup(dir, layout = 'one', mode = 'light') {
  let body = '', x0 = 0, y0, x1, y1;
  if (layout === 'one') {
    const t = setRuns(nameRuns(dir, mode, 'one'), { space: SPACE, kernAdjust: KADJ });
    if (dir.noSymbolInLockup) {
      body = textGroup(t, -t.bbox.x0);
      x1 = t.bbox.x1 - t.bbox.x0; y0 = t.bbox.y0; y1 = t.bbox.y1;
    } else {
      const { symH, gap } = dir.one;
      const sc = symH / (dir.inkBox[3] - dir.inkBox[1]);
      // B: center the pocket body (not the pen) on the cap height, so the pen rises like an ascender
      const top = dir.one.alignPocket ? -CAP / 2 - (dir.pocketMid - dir.inkBox[1]) * sc : -CAP / 2 - symH / 2;
      const sg = symbolGroup(dir, mode, 0, top, symH);
      const tx = sg.w + gap - t.bbox.x0;
      body = sg.svg + textGroup(t, tx);
      x1 = tx + t.bbox.x1; y0 = Math.min(top, t.bbox.y0); y1 = Math.max(top + symH, t.bbox.y1);
    }
  } else {
    const t1 = setRuns(nameRuns(dir, mode, 1), { space: SPACE, kernAdjust: KADJ });
    const t2 = setRuns(nameRuns(dir, mode, 2), { space: SPACE, kernAdjust: KADJ });
    const blockTop = -CAP, blockBot = LEAD; // cap top of line 1 to baseline of line 2
    const lx = Math.min(t1.bbox.x0, t2.bbox.x0);
    if (dir.noSymbolInLockup) {
      body = textGroup(t1, -lx) + textGroup(t2, -lx, LEAD);
      x1 = Math.max(t1.bbox.x1, t2.bbox.x1) - lx; y0 = t1.bbox.y0; y1 = LEAD + t2.bbox.y1;
    } else {
      // A spans cap top to baseline; B is 10% taller with the pocket on the last baseline and the pen rising past line one
      const h = (blockBot - blockTop) * (dir === B ? 1.1 : 1);
      const top = blockBot - h + (dir === B ? 3 : 0);
      const sg = symbolGroup(dir, mode, 0, top, h);
      const tx = sg.w + dir.stack.gap - lx;
      body = sg.svg + textGroup(t1, tx) + textGroup(t2, tx, LEAD);
      x1 = tx + Math.max(t1.bbox.x1, t2.bbox.x1); y0 = Math.min(top, t1.bbox.y0); y1 = Math.max(top + h, LEAD + t2.bbox.y1);
    }
  }
  const pad = 1;
  const vb = [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2];
  return { vb, body, baselineFromTop: -y0 + pad, capPx: CAP };
}

module.exports = { A, B, C: C_, all: [A, B, C_], lockup, CAP, LEAD };
