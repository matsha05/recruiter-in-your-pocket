// Shared helpers: font outlines, kerning, geometry, palette.
// Kerning comes from kern.json (GPOS pairs measured in Chromium by kern.cjs; opentype.js 0.11 cannot read them).
const path = require('path');
const fs = require('fs');
// the repo's web/ folder: fonts and node_modules (opentype.js, playwright) come from there
const W = process.env.RIYP_WEB || path.resolve(__dirname, '../../../../web');
const opentype = require(W + '/node_modules/opentype.js');

const FONT_FILES = {
  sx: W + '/public/fonts/schibsted-grotesk/SchibstedGrotesk-ExtraBold.woff',
  ss: W + '/public/fonts/schibsted-grotesk/SchibstedGrotesk-Semibold.woff',
  sr: W + '/public/fonts/schibsted-grotesk/SchibstedGrotesk-Regular.woff',
  li: W + '/public/fonts/literata/Literata-Italic.woff',
  lr: W + '/public/fonts/literata/Literata-Regular.woff',
};
const fonts = {};
for (const [k, f] of Object.entries(FONT_FILES)) fonts[k] = opentype.loadSync(f);
const KERN = JSON.parse(fs.readFileSync(path.join(__dirname, 'kern.json'), 'utf8'));

const C = {
  ink: '#111513', ground: '#f4f4f1', paper: '#ffffff', inset: '#e9eae6', muted: '#5a605c',
  pen: '#1f5a46', penTint: '#e6f0eb', hl: '#ffe14d', missInk: '#6b5400', line: '#dfe0dc', blue: '#2448a8',
  // dark mode (from globals.css .dark tokens)
  dGround: '#121513', dCard: '#181c1a', dFg: '#eceeed', dMuted: '#a1aaa5', dPen: '#8ed2b3', dHl: '#5c4b00', dLine: '#2a302d',
};

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Lay out runs of text as outline paths.
 * runs: [{ text, font: 'sx'|'li'..., size, fill, tracking (em), dx (extra units before run), scale }]
 * opts.kernAdjust: { 'Yo': units-in-em/1000 } extra optical kerning, applied on top of GPOS.
 * opts.space: em width override for word spaces (of run size)
 * Returns { paths: [{d, fill}], width, bbox:{x0,y0,x1,y1} } in px at baseline y=0.
 */
function setRuns(runs, opts = {}) {
  let x = 0;
  const out = [];
  const bb = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  let prev = null; // {ch, font, size}
  for (const run of runs) {
    const font = fonts[run.font];
    const size = run.size;
    const upm = font.unitsPerEm;
    const k = KERN[run.font];
    const track = (run.tracking || 0) * size;
    x += run.dx || 0;
    let d = '';
    const chars = [...run.text];
    chars.forEach((ch, i) => {
      if (prev && prev.font === run.font && prev.size === size) {
        const pair = prev.ch + ch;
        x += ((k[pair] || 0) / upm) * size;
      }
      if (prev && opts.kernAdjust && opts.kernAdjust[prev.ch + ch] !== undefined) {
        x += (opts.kernAdjust[prev.ch + ch] / 1000) * size;
      }
      if (ch === ' ') {
        const sp = opts.space !== undefined ? opts.space * size : (font.charToGlyph(' ').advanceWidth / upm) * size;
        x += sp;
        prev = { ch, font: run.font, size };
        return;
      }
      const g = font.charToGlyph(ch);
      const p = g.getPath(x, run.baseline || 0, size);
      d += p.toPathData(2);
      const gb = { x0: x + (g.xMin / upm) * size, x1: x + (g.xMax / upm) * size, y0: (run.baseline || 0) - (g.yMax / upm) * size, y1: (run.baseline || 0) - (g.yMin / upm) * size };
      if (g.xMin !== undefined && g.xMax !== undefined) {
        bb.x0 = Math.min(bb.x0, gb.x0); bb.x1 = Math.max(bb.x1, gb.x1);
        bb.y0 = Math.min(bb.y0, gb.y0); bb.y1 = Math.max(bb.y1, gb.y1);
      }
      x += (g.advanceWidth / upm) * size;
      if (i < chars.length - 1) x += track;
      prev = { ch, font: run.font, size };
    });
    x += run.after || 0;
    out.push({ d, fill: run.fill });
  }
  return { paths: out, width: x, bbox: bb };
}

const metric = (fontKey, which) => {
  const f = fonts[fontKey];
  const os2 = f.tables.os2;
  return (which === 'cap' ? os2.sCapHeight : os2.sxHeight) / f.unitsPerEm;
};

// geometry
function rrect(x, y, w, h, r) {
  const rr = Array.isArray(r) ? r : [r, r, r, r]; // tl tr br bl
  const [tl, tr, br, bl] = rr.map((v) => Math.min(v, w / 2, h / 2));
  return `M${r2(x + tl)} ${r2(y)}H${r2(x + w - tr)}` + (tr ? `A${tr} ${tr} 0 0 1 ${r2(x + w)} ${r2(y + tr)}` : '') +
    `V${r2(y + h - br)}` + (br ? `A${br} ${br} 0 0 1 ${r2(x + w - br)} ${r2(y + h)}` : '') +
    `H${r2(x + bl)}` + (bl ? `A${bl} ${bl} 0 0 1 ${r2(x)} ${r2(y + h - bl)}` : '') +
    `V${r2(y + tl)}` + (tl ? `A${tl} ${tl} 0 0 1 ${r2(x + tl)} ${r2(y)}` : '') + 'Z';
}
function poly(pts) { return 'M' + pts.map(([a, b]) => `${r2(a)} ${r2(b)}`).join('L') + 'Z'; }
// counter-clockwise rect (for holes with nonzero rule)
function rectCCW(x, y, w, h) { return `M${r2(x)} ${r2(y)}V${r2(y + h)}H${r2(x + w)}V${r2(y)}Z`; }

function svgDoc(vb, body, { title = 'Recruiter in Your Pocket', w, h } = {}) {
  const [x, y, vw, vh] = vb;
  const size = w ? ` width="${w}" height="${h}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(x)} ${r2(y)} ${r2(vw)} ${r2(vh)}"${size} role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;
}

module.exports = { fonts, KERN, C, setRuns, metric, rrect, poly, rectCCW, svgDoc, r2, W };
