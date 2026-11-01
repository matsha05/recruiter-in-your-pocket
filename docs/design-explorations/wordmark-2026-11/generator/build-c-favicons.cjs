// Direction C favicon options: writes c-two-voices/favicons/<option>/{16,32,180}-{light,dark}.svg and board-c-favicons.html.
// Usage: node build-c-favicons.cjs [outDir]  (build.cjs also runs it)
const fs = require('fs');
const path = require('path');
const { C, svgDoc, W } = require('./lib.cjs');
const D = require('./directions.cjs');
const { options, svgFor } = require('./cfav.cjs');
const { chromium } = require(W + '/node_modules/playwright');

const NAME = 'Recruiter in Your Pocket';
const font64 = (rel) => fs.readFileSync(path.join(W, 'public/fonts', rel)).toString('base64');

async function run(OUT) {
  OUT = path.resolve(OUT || path.join(__dirname, '..'));
  const SIZES = [16, 32, 180], MODES = ['light', 'dark'];

  // 1. files
  for (const o of options) {
    const dir = path.join(OUT, 'c-two-voices', 'favicons', o.key);
    fs.mkdirSync(dir, { recursive: true });
    for (const n of SIZES) for (const m of MODES) {
      fs.writeFileSync(path.join(dir, `${n}-${m}.svg`), svgDoc([0, 0, n, n], svgFor(o, n, m)) + '\n');
    }
  }

  // 2. true-size rasters (what a standard screen shows)
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const ras = {};
  for (const o of options) for (const n of [16, 32]) for (const m of MODES) {
    await page.setContent(`<body style="margin:0">${svgDoc([0, 0, n, n], svgFor(o, n, m), { w: n, h: n }).replace('<svg ', '<svg style="display:block" ')}</body>`);
    ras[`${o.key}-${n}-${m}`] = 'data:image/png;base64,' + (await (await page.$('svg')).screenshot({ omitBackground: true })).toString('base64');
  }
  await browser.close();

  // 3. board
  const logo = (() => {
    const lk = D.lockup(D.C, 'one', 'light'), px = 21;
    return svgDoc(lk.vb, lk.body, { w: +(lk.vb[2] * px / 100).toFixed(2), h: +(lk.vb[3] * px / 100).toFixed(2) });
  })();
  const icon = (o, m, px) => svgDoc([0, 0, 180, 180], svgFor(o, 180, m), { w: px, h: px });
  const tabs = (o, m) => `<div class="tabbar ${m}"><div class="tab"><img src="${ras[`${o.key}-16-${m}`]}" width="16" height="16" alt=""><span>${NAME}</span><b>×</b></div><div class="tab off"><span>New Tab</span></div></div>`;
  const zoom = (o, n, m, scale) => `<div class="zoom ${m}"><div class="zgrid${n === 16 ? ' g' : ''}" style="width:${n * scale}px;height:${n * scale}px;background-size:${scale}px ${scale}px"><img src="${ras[`${o.key}-${n}-${m}`]}" width="${n * scale}" height="${n * scale}" alt=""></div></div>`;
  const browserMock = (o) => `<div class="scaler" data-w="1280" data-h="161"><div class="win" style="width:1280px">
      <div class="tabbar light win-tabs"><div class="tab"><img src="${ras[`${o.key}-16-light`]}" width="16" height="16" alt=""><span>${NAME}</span><b>×</b></div><div class="tab off"><span>New Tab</span></div></div>
      <div class="addr"><span class="dots"><i></i><i></i></span><span class="url">recruiterinyourpocket.com</span></div>
      <div class="hdr"><a class="logo">${logo}</a><nav><span>How it works</span><span>Pricing</span><span>Research</span><span class="pill">Read mine</span></nav></div>
    </div></div>`;

  const letters = ['C1', 'C2', 'C3'];
  const sections = options.map((o, i) => `<section class="opt" id="${o.key}">
    <div class="wrap">
      <p class="eyebrow">Option ${letters[i]}${i === 0 ? ' · Recommended' : ''}</p>
      <h2>${o.name}</h2>
      <p class="why">${o.rationale}</p>
      <div class="grid">
        <figure><p class="label">Browser tabs, real size on a standard screen (the 16 px drawing)</p>${tabs(o, 'light')}${tabs(o, 'dark')}
          <div class="real"><span class="label">Real size</span>
            <img src="${ras[`${o.key}-16-light`]}" width="16" height="16" alt=""><img src="${ras[`${o.key}-32-light`]}" width="32" height="32" alt="">
            <span class="sep"></span>
            <img src="${ras[`${o.key}-16-dark`]}" width="16" height="16" alt=""><img src="${ras[`${o.key}-32-dark`]}" width="32" height="32" alt=""></div>
          <p class="note">${o.bends}</p></figure>
        <figure><p class="label">16 px enlarged 8× (each square is one pixel) and 32 px enlarged 4×</p>
          <div class="zooms">${zoom(o, 16, 'light', 8)}${zoom(o, 16, 'dark', 8)}${zoom(o, 32, 'light', 4)}${zoom(o, 32, 'dark', 4)}</div></figure>
      </div>
      <div class="grid grid-b">
        <figure><p class="label">Home screen, 180 px real size</p>
          <div class="homes"><div class="home light"><div class="ios">${icon(o, 'light', 180)}</div><span>Recruiter</span></div><div class="home dark"><div class="ios">${icon(o, 'dark', 180)}</div><span>Recruiter</span></div></div></figure>
        <figure><p class="label">Beside the logotype: tab and site header, real size</p>${browserMock(o)}</figure>
      </div>
    </div></section>`).join('\n');

  const glance = options.map((o, i) => `<a class="gl" href="#${o.key}"><div class="gl-icons"><div class="gl-i">${icon(o, 'light', 72)}</div><div class="gl-i">${icon(o, 'dark', 72)}</div><img src="${ras[`${o.key}-16-light`]}" width="16" height="16" alt=""><img src="${ras[`${o.key}-32-light`]}" width="32" height="32" alt=""></div><span>${letters[i]} · ${o.name}</span></a>`).join('');

  const css = `
@font-face{font-family:"Schibsted Grotesk";src:url(data:font/woff2;base64,${font64('schibsted-grotesk/SchibstedGrotesk-Variable.woff2')}) format("woff2");font-weight:400 900;font-display:block}
@font-face{font-family:"Literata";src:url(data:font/woff2;base64,${font64('literata/Literata-Variable.woff2')}) format("woff2");font-weight:200 900;font-style:normal;font-display:block}
:root{--ground:#f4f4f1;--paper:#fff;--inset:#e9eae6;--ink:#111513;--muted:#5a605c;--pen:#1f5a46;--line:#dfe0dc}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
svg{display:block}
img{image-rendering:pixelated}
figure{margin:0;min-width:0}
.wrap{max-width:1360px;margin:0 auto;padding:0 40px}
.eyebrow,.label{margin:0 0 10px;color:var(--muted);font-size:13px;font-weight:600}
.head{padding-top:56px;padding-bottom:8px}
.head h1{margin:0;font-size:48px;line-height:1.02;font-weight:800;letter-spacing:-.035em}
.lede{max-width:66ch;margin:16px 0 28px;color:var(--muted);font-size:17px;line-height:1.55}
.glance{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.gl{display:flex;flex-direction:column;gap:12px;padding:16px 18px;border:1px solid var(--line);border-radius:18px;background:var(--paper);color:inherit;text-decoration:none;font-size:15px;font-weight:600}
.gl-icons{display:flex;align-items:center;gap:14px}
.gl-i{width:72px;height:72px;border-radius:16px;overflow:hidden;box-shadow:0 0 0 1px rgba(17,21,19,.1)}
.rec{max-width:70ch;margin:18px 0 0;font-size:15px}
.opt{margin-top:64px;padding-top:52px;border-top:1px solid var(--line)}
.opt h2{margin:0;font-size:36px;line-height:1.05;font-weight:800;letter-spacing:-.03em}
.why{max-width:70ch;margin:12px 0 28px;font-family:Literata,Georgia,serif;font-size:18px;line-height:1.5}
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px}
.grid-b{margin-top:36px;grid-template-columns:minmax(0,1fr);gap:36px}
.tabbar{display:flex;align-items:flex-end;gap:2px;height:44px;padding:8px 10px 0;border-radius:12px 12px 0 0;background:#dee1e6;margin-bottom:12px}
.tabbar .tab{display:flex;align-items:center;gap:9px;width:240px;height:36px;padding:0 12px;border-radius:9px 9px 0 0;background:#fff;color:#1f1f1f;font:400 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif}
.tabbar .tab span{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.tabbar .tab b{font-weight:400;color:#5f6368}
.tabbar .tab.off{width:150px;background:transparent;color:#5f6368}
.tabbar.dark{background:#1f1f1f}
.tabbar.dark .tab{background:#3c3c3c;color:#e3e3e3}
.tabbar.dark .tab b,.tabbar.dark .tab.off{color:#9aa0a6;background:transparent}
.tabbar.dark .tab:first-child b{color:#9aa0a6}
.tabbar.dark .tab:first-child{background:#3c3c3c}
.real{display:flex;align-items:center;gap:16px;margin-top:4px;padding:16px 18px;border:1px solid var(--line);border-radius:14px;background:var(--paper)}
.real .label{margin:0 6px 0 0}
.real .sep{width:1px;height:28px;background:var(--line)}
.note{margin:12px 0 0;font-size:14px;color:var(--muted)}
.zooms{display:grid;grid-template-columns:repeat(4,max-content);gap:14px;align-items:end}
.zoom{padding:10px;border-radius:12px}
.zoom.light{background:#dee1e6}
.zoom.dark{background:#1f1f1f}
.zgrid{position:relative}
.zgrid img{display:block}
.zgrid.g::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(220,60,60,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(220,60,60,.16) 1px,transparent 1px);background-size:inherit}
.homes{display:flex;gap:16px}
.home{display:flex;flex-direction:column;align-items:center;gap:10px;padding:22px 26px 16px;border-radius:18px;font:500 13px/1 system-ui,-apple-system,sans-serif}
.home.light{background:#d8dcd4;color:#1f1f1f}
.home.dark{background:#0b0d0c;color:#e3e3e3}
.ios{width:180px;height:180px;border-radius:40px;overflow:hidden;box-shadow:0 0 0 1px rgba(17,21,19,.1)}
.scaler{position:relative;width:100%;overflow:hidden}
.scaler>*{position:absolute;top:0;left:0;transform-origin:0 0}
.win{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--ground)}
.win-tabs{margin:0;border-radius:0}
.addr{display:flex;align-items:center;gap:14px;height:40px;padding:0 14px;background:#fff;border-bottom:1px solid #dadce0}
.addr .dots{display:flex;gap:6px}.addr .dots i{width:10px;height:10px;border-radius:50%;background:#dadce0}
.addr .url{flex:1;max-width:520px;height:28px;padding:0 14px;border-radius:14px;background:#f1f3f4;color:#3c4043;font:400 13px/28px system-ui,-apple-system,sans-serif}
.hdr{display:flex;align-items:center;justify-content:space-between;height:73px;padding:0 46px;border-bottom:1px solid var(--line);background:var(--ground)}
.hdr nav{display:flex;align-items:center;gap:12px}
.hdr nav span{padding:0 11.5px;color:var(--muted);font-size:15px;font-weight:500}
.hdr nav .pill{display:inline-flex;align-items:center;min-height:48px;margin-left:12px;padding:0 24px;border-radius:999px;background:var(--ink);color:#fff}
.foot{margin-top:64px;padding-bottom:56px;color:var(--muted);font-size:14px}.foot p{max-width:80ch;margin:0}
@media (max-width:1100px){.grid,.grid-b{grid-template-columns:minmax(0,1fr)}.glance{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .wrap{padding:0 16px}.head{padding-top:36px}.head h1{font-size:34px}.lede{font-size:16px}
  .opt{margin-top:44px;padding-top:36px}.opt h2{font-size:30px}.why{font-size:17px}
  .tabbar .tab{width:210px}.tabbar .tab.off{display:none}
  .zooms{grid-template-columns:repeat(2,max-content)}
  .zoom:nth-child(n+3) .zgrid{width:128px!important;height:128px!important;background-size:4px 4px!important}
  .zoom:nth-child(n+3) img{width:128px;height:128px}
  .homes{gap:10px}.home{padding:16px 12px 12px}.ios{width:140px;height:140px;border-radius:31px}.ios svg{width:140px;height:140px}
}`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Two Voices favicons</title><style>${css}</style></head>
<body>
<header class="wrap head">
  <p class="eyebrow">${NAME} · Direction C favicon · November 2026 · For review, not shipped</p>
  <h1>A favicon for Two Voices</h1>
  <p class="lede">Two Voices is the pick, and a plain R is too generic for it. Each option below puts the recruiter’s Literata italic, in the green pen, next to or inside the product’s Schibsted R. The 16 px versions are redrawn on whole pixels rather than scaled down, and every file comes in light (paper tile) and dark (ink tile).</p>
  <div class="glance">${glance}</div>
  <p class="rec"><b>Recommendation: C1, The Finished R.</b> It is the only option where the two voices make one shape, the way the italic “in” sits inside the name, and it still reads as an R in a 16 px tab.</p>
</header>
${sections}
<footer class="wrap foot"><p>Set aside: the italic “in” on its own. It is the prettiest at 180 px, but a rounded tile that says “in” reads as LinkedIn in exactly the place job seekers keep LinkedIn open. Files: docs/design-explorations/wordmark-2026-11/c-two-voices/favicons/.</p></footer>
<script>
function fit(){document.querySelectorAll('.scaler').forEach(function(s){var w=+s.dataset.w,h=+s.dataset.h,k=Math.min(1,s.clientWidth/w);s.firstElementChild.style.transform='scale('+k+')';s.style.height=(h*k)+'px';});}
fit();addEventListener('resize',fit);document.fonts&&document.fonts.ready.then(fit);
</script>
</body></html>`;
  fs.writeFileSync(path.join(OUT, 'board-c-favicons.html'), html);
  console.log('board-c-favicons', (html.length / 1024).toFixed(0) + 'KB');
}

module.exports = { run };
if (require.main === module) run(process.argv[2]);
