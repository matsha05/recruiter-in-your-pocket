// Favicon options for direction C (Two Voices). Each option draws itself at 16 (hand-placed on whole pixels),
// 32 (font outlines scaled so the R's stem is a whole number of pixels) and 180 (font outlines), light and dark.
const { fonts, C, rrect, setRuns, r2 } = require('./lib.cjs');

const P = (d, f) => `<path d="${d}" fill="${f}"/>`;
const S = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/>`;
const pal = (m) => (m === 'dark' ? { bg: C.ink, fg: C.ground, pen: C.dPen } : { bg: C.paper, fg: C.ink, pen: C.pen });
// favicons get their own rounded tile; the 180 app icon is full bleed because iOS applies its own mask
const tile = (n, bg) => P(rrect(0, 0, n, n, n === 180 ? 0 : n * 0.22), bg);

/* font-outline helpers (font units, y up) */
const toD = (cmds, tx) => cmds.map((c) => {
  const p = (x, y) => tx(x, y).map(r2).join(' ');
  if (c.type === 'M') return 'M' + p(c.x, c.y);
  if (c.type === 'L') return 'L' + p(c.x, c.y);
  if (c.type === 'Q') return 'Q' + p(c.x1, c.y1) + ' ' + p(c.x, c.y);
  if (c.type === 'C') return 'C' + p(c.x1, c.y1) + ' ' + p(c.x2, c.y2) + ' ' + p(c.x, c.y);
  return 'Z';
}).join('');
const glyphCmds = (f, ch) => fonts[f].charToGlyph(ch).path.commands;
// Schibsted ExtraBold R with its leg removed: the bowl closes straight along its underside (units of 2048)
const sxR = glyphCmds('sx', 'R');
const R_NOLEG = (() => {
  const out = [];
  for (const c of sxR) {
    out.push(c);
    if (c.type === 'L' && Math.round(c.x) === 1032 && Math.round(c.y) === 597) break; // end of the bowl curve
  }
  out.push({ type: 'L', x: 646, y: 577 }, { type: 'L', x: 494, y: 577 }, { type: 'Z' });
  const counter = sxR.slice(sxR.findIndex((c, i) => i > 0 && c.type === 'M'));
  return out.concat(counter);
})();
// Literata Italic R: just its leg, cut at the junction (288,322)-(356,339), which lands inside the Schibsted bowl
const LIT_LEG = (() => {
  const cmds = glyphCmds('li', 'R');
  const s = cmds.findIndex((c) => c.type === 'L' && Math.round(c.x) === 356 && Math.round(c.y) === 339);
  const e = cmds.findIndex((c, i) => i > s && Math.round(c.x) === 288 && Math.round(c.y) === 322);
  return [{ type: 'M', x: 356, y: 339 }, ...cmds.slice(s + 1, e + 1), { type: 'Z' }];
})();
const STEM = 494 - 133; // Schibsted R stem width in font units

/* ---------- C1. The Finished R ---------- */
const C1 = {
  key: 'c1-finished-r',
  name: 'The Finished R',
  rationale: 'Schibsted’s R with its leg written in Literata italic, in the green pen. The product sets the letter and the recruiter finishes it: both voices in one shape, the same move as the italic “in” in the logotype.',
  bends: 'At 16 px the italic leg becomes a 2 px pen stroke with the same curl, tucked under a bowl drawn on whole pixels.',
  px16(m) {
    const p = pal(m);
    const body = 'M2 2H8C11 2 12.5 3.4 12.5 5.5C12.5 7.6 11 9 8 9H5V13H2Z' + 'M5 4V7H7.6C8.8 7 9.4 6.4 9.4 5.5C9.4 4.6 8.8 4 7.6 4Z';
    return tile(16, p.bg) + S('M6.6 8.2L9.5 11.3Q10.6 12.4 12 12.1L14 11.4', p.pen, 2) + P(body, p.fg);
  },
  vec(n, m) {
    const p = pal(m);
    // 32: stem exactly 5 px, stem edge and baseline on whole pixels. 180: cap at 58% of the tile.
    const k = n === 32 ? 5 / STEM : (0.58 * n) / 1440;
    const lk = k * 2.048 * 1.15; // Literata (1000 upm) to px at the same cap height, leg 15% fuller
    const legDX = -40;
    const width = (646 + legDX - 133) * k + (678 - 288) * lk; // stem edge to the end of the curl
    const x0 = Math.round((n - width) / 2) - 133 * k;
    const base = Math.round((n + 1440 * k) / 2);
    const tx = (x, y) => [x0 + x * k, base - y * k];
    const tl = (x, y) => [x0 + (646 + legDX) * k + (x - 288) * lk, base - y * lk];
    return tile(n, p.bg) + P(toD(LIT_LEG, tl), p.pen) + P(toD(R_NOLEG, tx), p.fg);
  },
};

/* ---------- C2. The Noted R ---------- */
const C2 = {
  key: 'c2-noted-r',
  name: 'The Noted R',
  rationale: 'The R, underlined once in the recruiter’s pen, with italic-cut ends and a slight lift at the finish. The crispest at 16 px and the closest to today’s favicon, but the stroke says less about two voices than C1 does.',
  bends: 'At 16 px the stroke is a flat 2 px bar; the lift only shows from 32 px up.',
  px16(m) {
    const p = pal(m);
    const R = 'M2 2H8C11 2 12.5 3.3 12.5 5.3C12.5 6.8 11.7 7.8 10.3 8.2L13 12H9.6L7.4 8.6H5V12H2Z' + 'M5 4V6.6H7.6C8.7 6.6 9.3 6.1 9.3 5.3C9.3 4.5 8.7 4 7.6 4Z';
    return tile(16, p.bg) + P(R, p.fg) + P('M2.5 13H13.5L13 15H2Z', p.pen);
  },
  vec(n, m) {
    const p = pal(m);
    const k = n === 32 ? 4 / STEM : (0.47 * n) / 1440;
    const w = (1416 - 133) * k;
    const x0 = Math.round((n - w) / 2) - 133 * k;
    const cap = 1440 * k;
    // 32: a flat 3 px bar two pixels under the baseline, on whole pixels. 180: a pen stroke that tapers and lifts.
    const bar = n === 32 ? 3 : n * 0.062, gap = n === 32 ? 2 : n * 0.07;
    const top = Math.round((n - (cap + gap + bar)) / 2);
    const base = top + Math.round(cap);
    const tx = (x, y) => [x0 + x * k, base - y * k];
    const L = x0 + 133 * k - (n === 32 ? 0 : n * 0.015), Rr = x0 + 1416 * k + (n === 32 ? 0 : n * 0.03), y0 = base + gap;
    const sl = n === 32 ? 1 : bar * 0.6, lift = n === 32 ? 0 : n * 0.012, taper = n === 32 ? 1 : 0.72;
    const stroke = `M${r2(L + sl)} ${r2(y0)}L${r2(Rr)} ${r2(y0 - lift)}L${r2(Rr - sl * taper)} ${r2(y0 + bar * taper - lift)}L${r2(L)} ${r2(y0 + bar)}Z`;
    return tile(n, p.bg) + P(toD(sxR, tx), p.fg) + P(stroke, p.pen);
  },
};

/* ---------- C3. R in ---------- */
const C3 = {
  key: 'c3-r-in',
  name: 'R in',
  rationale: 'The R and the italic “in” side by side: the first two words of the name in their two voices. The most literal link to the logotype, but at 16 px the italic turns into upright pixels and the pair reads as “Rin”.',
  bends: 'At 16 px the italic “in” is redrawn as 1 px upright strokes; the slant and the hand only return at 32 px.',
  px16(m) {
    const p = pal(m);
    const R = 'M1 3H5.5C7.5 3 8.5 4 8.5 5.6C8.5 6.8 7.9 7.6 6.9 7.9L8.8 12H6.5L4.9 8.3H3V12H1Z' + 'M3 4.7V6.6H5.3C6 6.6 6.4 6.2 6.4 5.65C6.4 5.1 6 4.7 5.3 4.7Z';
    const IN = 'M10 5h1v1h-1z' + 'M10 7h1v4.2h.5v.8H10z' + 'M12 7h1v.6Q13.5 7 14.2 7Q15 7 15 8V11.2H15.4V12H14V8.4Q14 8 13.7 8Q13.3 8 13 8.6V12H12z';
    return tile(16, p.bg) + P(R, p.fg) + P(IN, p.pen);
  },
  vec(n, m) {
    const p = pal(m);
    const k = n === 32 ? 3 / STEM : (0.33 * n) / 1440;
    const sizeS = k * 2048;
    const xh = 0.72 * 1440 * k; // italic x-height, a touch under Schibsted's own
    const sizeL = xh / 0.507;
    const R = setRuns([{ text: 'R', font: 'sx', size: sizeS }]);
    const IN = setRuns([{ text: 'in', font: 'li', size: sizeL }]);
    const gap = n * 0.035;
    const w = (R.bbox.x1 - R.bbox.x0) + gap + (IN.bbox.x1 - IN.bbox.x0);
    const x0 = Math.round((n - w) / 2) - R.bbox.x0;
    const base = Math.round((n + 1440 * k) / 2 + n * 0.02);
    const xin = x0 + R.bbox.x1 + gap - IN.bbox.x0;
    return tile(n, p.bg) + `<g transform="translate(${r2(x0)} ${base})">${P(R.paths[0].d, p.fg)}</g><g transform="translate(${r2(xin)} ${base})">${P(IN.paths[0].d, p.pen)}</g>`;
  },
};

const options = [C1, C2, C3];
const svgFor = (opt, n, m) => (n === 16 ? opt.px16(m) : opt.vec(n, m));
module.exports = { options, svgFor, pal };
