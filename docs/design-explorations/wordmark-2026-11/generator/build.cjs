// Generates every SVG plus board.html. Usage: node build.cjs [outDir] (defaults to the folder above this one)
const fs = require('fs');
const path = require('path');
const { C, svgDoc, r2, W } = require('./lib.cjs');
const D = require('./directions.cjs');
const { chromium } = require(W + '/node_modules/playwright');

const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
fs.mkdirSync(OUT, { recursive: true });

const NAME = 'Recruiter in Your Pocket';
const sizeOf = (lk, fontPx) => ({ w: r2(lk.vb[2] * fontPx / 100), h: r2(lk.vb[3] * fontPx / 100) });
const lockSvg = (lk, fontPx, extra = '') => { const s = sizeOf(lk, fontPx); return svgDoc(lk.vb, lk.body, { w: s.w, h: s.h }).replace('<svg ', `<svg ${extra} `); };
const fileSvg = (vb, body) => svgDoc(vb, body) + '\n';

/* ---------- 1. files ---------- */
const files = {};
for (const dir of D.all) {
  const dirOut = path.join(OUT, dir.key);
  fs.mkdirSync(dirOut, { recursive: true });
  const f = {};
  f['symbol.svg'] = fileSvg([0, 0, 32, 32], dir.symbol('light'));
  if (!dir.noSymbolInLockup) f['symbol-dark.svg'] = fileSvg([0, 0, 32, 32], dir.symbol('dark'));
  f['favicon.svg'] = fileSvg([0, 0, 32, 32], dir.fav32('light'));
  f['favicon-16.svg'] = fileSvg([0, 0, 16, 16], dir.fav16('light'));
  if (dir.key === 'b-pocket-pen') {
    const swap = (body) => body.replaceAll(`fill="${C.ink}"`, 'class="k"').replaceAll(`fill="${C.pen}"`, 'class="p"');
    const style = `<style>.k{fill:${C.ink}}.p{fill:${C.pen}}@media (prefers-color-scheme:dark){.k{fill:${C.dFg}}.p{fill:${C.dPen}}}</style>`;
    f['favicon.svg'] = fileSvg([0, 0, 32, 32], style + swap(dir.fav32('light')));
    f['favicon-16.svg'] = fileSvg([0, 0, 16, 16], style + swap(dir.fav16('light')));
  }
  f['app-icon.svg'] = fileSvg([0, 0, 180, 180], dir.app());
  for (const [suffix, layout, mode] of [['', 'one', 'light'], ['-dark', 'one', 'dark'], ['-stacked', 'stacked', 'light'], ['-stacked-dark', 'stacked', 'dark']]) {
    const lk = D.lockup(dir, layout, mode);
    f[`logotype${suffix}.svg`] = fileSvg(lk.vb, lk.body);
  }
  for (const [n, s] of Object.entries(f)) fs.writeFileSync(path.join(dirOut, n), s);
  files[dir.key] = f;
}

/* ---------- 2. rasterize favicons at true size ---------- */
async function rasterize(jobs) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const out = {};
  for (const [id, svg, px] of jobs) {
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${px}" height="${px}" style="display:block" `)}</body></html>`);
    const el = await page.$('svg');
    out[id] = 'data:image/png;base64,' + (await el.screenshot({ omitBackground: true })).toString('base64');
  }
  await browser.close();
  return out;
}

const font64 = (rel) => fs.readFileSync(path.join(W, 'public/fonts', rel)).toString('base64');

(async () => {
  const jobs = [];
  for (const dir of D.all) {
    const f = files[dir.key];
    const light16 = svgDoc([0, 0, 16, 16], dir.fav16('light'));
    const light32 = svgDoc([0, 0, 32, 32], dir.fav32());
    const dark16 = dir.key === 'b-pocket-pen' ? svgDoc([0, 0, 16, 16], dir.fav16('dark')) : light16;
    const dark32 = dir.key === 'b-pocket-pen' ? svgDoc([0, 0, 32, 32], dir.fav32('dark')) : light32;
    jobs.push([`${dir.key}-16`, light16, 16], [`${dir.key}-32`, light32, 32], [`${dir.key}-16d`, dark16, 16], [`${dir.key}-32d`, dark32, 32]);
    // what the un-hinted 32 art does at 16, for comparison in the README
    jobs.push([`${dir.key}-32at16`, light32, 16]);
  }
  const ras = await rasterize(jobs);

  /* ---------- 3. board ---------- */
  const css = fs.readFileSync(path.join(__dirname, 'board.css'), 'utf8');
  const fontsCss = `
@font-face{font-family:"Schibsted Grotesk";src:url(data:font/woff2;base64,${font64('schibsted-grotesk/SchibstedGrotesk-Variable.woff2')}) format("woff2");font-weight:400 900;font-style:normal;font-display:block}
@font-face{font-family:"Literata";src:url(data:font/woff2;base64,${font64('literata/Literata-Variable.woff2')}) format("woff2");font-weight:200 900;font-style:normal;font-display:block}
@font-face{font-family:"Literata";src:url(data:font/woff2;base64,${font64('literata/Literata-Italic-Variable.woff2')}) format("woff2");font-weight:200 900;font-style:italic;font-display:block}`;

  const menuIcon = `<svg width="22" height="22" viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8ZM40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16Zm176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16Z"/></svg>`;

  const desk = (logo) => `<div class="scaler" data-w="1440" data-h="73"><div class="hdr hdr-desk" style="width:1440px">
    <div class="hdr-in"><a class="logo" aria-label="${NAME} home">${logo}</a>
    <nav><div class="links"><span>How it works</span><span>Pricing</span><span>Research</span></div><span class="pill">Read mine</span></nav></div></div></div>`;
  const mob = (logo) => `<div class="scaler bleed" data-w="390" data-h="65"><div class="hdr hdr-mob" style="width:390px">
    <div class="hdr-in"><a class="logo" aria-label="${NAME} home">${logo}</a>
    <nav><span class="pill">Read mine</span><span class="menu">${menuIcon}</span></nav></div></div></div>`;

  const today = `<span class="today-mark">Recruiter<br>in your<br>pocket</span>`;

  const shareCard = (dir) => {
    const lk = D.lockup(dir, 'one', 'light');
    return `<div class="scaler" data-w="1200" data-h="630"><div class="og" style="width:1200px;height:630px">
      <div class="og-left">${lockSvg(lk, 28)}
        <div><div class="og-h">They called<br>someone back.<br>It wasn’t you.</div><div class="og-sub">See what a recruiter sees on your resume.</div></div>
        <div class="og-url">recruiterinyourpocket.com</div></div>
      <div class="og-right">
        <div class="og-resume"><div class="r-name">Jordan A. Miller</div><div class="r-meta">Denver, CO · jmiller@example.com</div>
          <div class="r-h">Objective</div><div>Results-driven, detail-oriented professional seeking a challenging role where I can utilize my skills.</div>
          <div class="r-h">Experience</div><div>Customer Success Manager, Northwind Analytics</div>
          <div class="r-b">• Responsible for managing customer relationships and renewals</div><div class="r-b">• Introduced monthly renewal-risk reviews across the portfolio</div><div class="r-b">• Team player with excellent communication skills</div></div>
        <div class="og-screen"><div class="m">Customer Success Manager · Req 4471</div><div class="s-name">Jordan A. Miller</div><div class="m">Applied 9 days ago</div>
          <div class="s-stage"><span>Stage</span><span class="chip">Not moving forward</span></div>
          <div class="m" style="margin-top:16px">Reviewer note · hiring team only</div><div class="s-note">Solid book of business, but the best example stops right before the good part.</div></div>
      </div></div></div>`;
  };

  const pdf = (dir) => {
    const lk = D.lockup(dir, 'one', 'light');
    return `<div class="scaler" data-w="794" data-h="430"><div class="pdf" style="width:794px;height:430px">
      <header><div>${lockSvg(lk, 20)}<div class="tagline">Resume report</div></div><div class="date">Nov 1, 2026</div></header>
      <div class="kicker">Recruiter First Impression</div>
      <h3>Solid book of business, but the best example stops right before the good part.</h3>
      <p>The renewal-risk reviews are the strongest thing on the page. Say what changed after you introduced them, and a recruiter will read the rest of the role differently.</p>
      <div class="pdf-lines"><i style="width:92%"></i><i style="width:86%"></i><i style="width:64%"></i></div>
    </div></div>`;
  };

  const email = (dir) => {
    const lk = D.lockup(dir, 'one', 'light');
    return `<div class="scaler" data-w="640" data-h="400"><div class="email" style="width:640px;height:400px"><div class="em-card">
      <div class="em-bar"></div>
      <div class="em-body">${lockSvg(lk, 17, `role="img"`)}
        <div class="em-h">Your code’s here.</div><p class="em-p">Pop it in and you’re back on the other side of the desk.</p>
        <div class="em-code">4821<span>0736</span></div><p class="em-small">It works once and expires soon.</p></div></div></div></div>`;
  };

  const favBlock = (dir) => {
    const k = dir.key;
    const tab = (theme) => `<div class="tabbar ${theme}"><div class="tab"><img src="${ras[`${k}-16${theme === 'dark' ? 'd' : ''}`]}" width="16" height="16" alt=""><span>${NAME}</span><b>×</b></div><div class="tab off"><span>New Tab</span></div></div>`;
    return `<div class="fav">
      ${tab('light')}${tab('dark')}
      <div class="fav-row">
        <div class="fav-cell"><div class="real"><img src="${ras[`${k}-16`]}" width="16" height="16" alt=""><img src="${ras[`${k}-32`]}" width="32" height="32" alt=""></div><span>16 and 32 px, real size</span></div>
        <div class="fav-cell"><img class="px" src="${ras[`${k}-16`]}" width="80" height="80" alt=""><span>16 px, enlarged 5×</span></div>
        <div class="fav-cell"><img class="px" src="${ras[`${k}-32`]}" width="80" height="80" alt=""><span>32 px, enlarged 2.5×</span></div>
        <div class="fav-cell"><div class="ios">${svgDoc([0, 0, 180, 180], dir.app(), { w: 120, h: 120 })}</div><span>Home screen, 180 px at ⅔</span></div>
      </div></div>`;
  };

  const swatches = (dir) => {
    const one = D.lockup(dir, 'one', 'light'), oneD = D.lockup(dir, 'one', 'dark');
    const st = D.lockup(dir, 'stacked', 'light'), stD = D.lockup(dir, 'stacked', 'dark');
    const sym = dir.noSymbolInLockup ? '' : `<div class="sw-sym">${svgDoc([0, 0, 32, 32], dir.symbol('light'), { w: 48, h: 48 })}</div>`;
    const symD = dir.noSymbolInLockup ? '' : `<div class="sw-sym">${svgDoc([0, 0, 32, 32], dir.symbol('dark'), { w: 48, h: 48 })}</div>`;
    return `<div class="swatches">
      <div class="sw sw-ground"><span class="sw-l">Ground</span>${lockSvg(one, 30)}<div class="sw-pair">${lockSvg(st, 24)}${sym}</div></div>
      <div class="sw sw-paper"><span class="sw-l">Paper</span>${lockSvg(one, 30)}<div class="sw-pair">${lockSvg(st, 24)}${sym}</div></div>
      <div class="sw sw-dark"><span class="sw-l">Dark</span>${lockSvg(oneD, 30)}<div class="sw-pair">${lockSvg(stD, 24)}${symD}</div></div>
    </div>`;
  };

  const HEADER_FONT = { 'a-marked-line': 20, 'b-pocket-pen': 20, 'c-two-voices': 21 };
  const MOBILE_FONT = { 'a-marked-line': 16, 'b-pocket-pen': 16, 'c-two-voices': 17 };
  const letters = ['A', 'B', 'C'];
  const glance = `<div class="glance">${D.all.map((dir, i) => `<a class="gl" href="#${dir.key}"><span class="gl-l">${letters[i]} \u00b7 ${dir.name}</span><div class="gl-row"><div class="gl-icon">${svgDoc([0, 0, 180, 180], dir.app(), { w: 64, h: 64 })}</div>${lockSvg(D.lockup(dir, 'one', 'light'), 20)}</div></a>`).join('')}</div>
  <p class="rec"><b>Recommendation: B, The Pocket Pen.</b> It explains the name, keeps yellow for the Critical Miss, and holds its shape at 16 px. Reasons and open questions are in README.md.</p>`;

  const sections = D.all.map((dir, i) => {
    const one = D.lockup(dir, 'one', 'light');
    const st = D.lockup(dir, 'stacked', 'light');
    return `<section class="dir" id="${dir.key}">
      <div class="wrap dir-head"><p class="eyebrow">Direction ${letters[i]}</p><h2>${dir.name}</h2><p class="why">${dir.rationale.join(' ')}</p></div>
      <div class="wrap"><p class="label">Site header at 1440 px (real size on a desktop screen). Logotype set at ${HEADER_FONT[dir.key]} px beside 15 px navigation.</p></div>
      ${desk(lockSvg(one, HEADER_FONT[dir.key]))}
      <div class="wrap grid-2">
        <figure><p class="label">Site header at 390 px, real size. Stacked lockup at ${MOBILE_FONT[dir.key]} px.</p>${mob(lockSvg(st, MOBILE_FONT[dir.key]))}
          <p class="label" style="margin-top:28px">Lockups on the three grounds</p>${swatches(dir)}</figure>
        <figure><p class="label">Favicon and home screen</p>${favBlock(dir)}</figure>
      </div>
      <div class="wrap grid-ctx">
        <figure><p class="label">Share card, 1200 × 630 scaled</p>${shareCard(dir)}</figure>
        <figure><p class="label">PDF report header, logotype at 15 pt</p>${pdf(dir)}</figure>
        <figure><p class="label">Sign-in email header</p>${email(dir)}</figure>
        <figure class="bends"><p class="label">Where it bends</p><ul>${dir.bends.map((x) => `<li>${x}</li>`).join('')}</ul></figure>
      </div>
    </section>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wordmark directions</title>
<style>${fontsCss}
${css}</style></head>
<body>
<header class="wrap board-head">
  <p class="eyebrow">${NAME} · Wordmark directions · November 2026 · For review, not shipped</p>
  <h1>Three ways to sign the work</h1>
  <p class="lede">Each direction is shown where it has to hold up: the site header beside 15 px navigation, a browser tab, a home screen, the share card, the PDF report, and the sign-in email. Every letter is an outline from Schibsted Grotesk or Literata, so the marks render without the web fonts.</p>
  ${glance}
  <p class="label">Today, for comparison: the 12 px stacked mark is smaller than the 15 px navigation beside it.</p>
</header>
${desk(today)}
${sections}
<footer class="wrap foot"><p>Files: docs/design-explorations/wordmark-2026-11/. Fonts: Schibsted Grotesk and Literata (SIL Open Font License). Palette and type from docs/design-system.md.</p></footer>
<script>
function fit(){document.querySelectorAll('.scaler').forEach(function(s){var w=+s.dataset.w,h=+s.dataset.h,k=Math.min(1,s.clientWidth/w);s.firstElementChild.style.transform='scale('+k+')';s.style.height=(h*k)+'px';});}
fit();addEventListener('resize',fit);document.fonts&&document.fonts.ready.then(fit);
</script>
</body></html>`;
  fs.writeFileSync(path.join(OUT, 'board.html'), html);
  console.log('board', (html.length / 1024).toFixed(0) + 'KB');
  await require('./build-c-favicons.cjs').run(OUT);
})();
