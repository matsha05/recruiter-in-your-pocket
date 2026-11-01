// Measure GPOS pair kerning with Chromium (opentype.js 0.11 can't read extension lookups).
const path = require('path');
const W = process.env.RIYP_WEB || path.resolve(__dirname, '../../../../web');
const { chromium } = require(W + '/node_modules/playwright');
const fs = require('fs');
const fonts = {
  sx: { file: W + '/public/fonts/schibsted-grotesk/SchibstedGrotesk-ExtraBold.woff', upm: 2048 },
  ss: { file: W + '/public/fonts/schibsted-grotesk/SchibstedGrotesk-Semibold.woff', upm: 2048 },
  sr: { file: W + '/public/fonts/schibsted-grotesk/SchibstedGrotesk-Regular.woff', upm: 2048 },
  li: { file: W + '/public/fonts/literata/Literata-Italic.woff', upm: 1000 },
  lr: { file: W + '/public/fonts/literata/Literata-Regular.woff', upm: 1000 },
};
const chars = 'RecruitnYoPkIRYPabcdfghjlmpqsvwxyzABCDEFGHJKLMNOQSTUVWXZ .,’';
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const css = Object.entries(fonts).map(([k, v]) => `@font-face{font-family:${k};src:url(data:font/woff;base64,${fs.readFileSync(v.file).toString('base64')}) format('woff');}`).join('\n');
  await page.setContent(`<style>${css}</style>` + Object.keys(fonts).map(k => `<span style="font-family:${k}">x</span>`).join(''));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const out = {};
  for (const [k, v] of Object.entries(fonts)) {
    out[k] = await page.evaluate(({ k, upm, chars }) => {
      const c = document.createElement('canvas').getContext('2d');
      c.font = `${upm}px ${k}`; c.fontKerning = 'normal';
      const res = {};
      for (const a of chars) for (const b of chars) {
        const v = c.measureText(a + b).width - c.measureText(a).width - c.measureText(b).width;
        if (Math.abs(v) > 0.5) res[a + b] = Math.round(v);
      }
      return res;
    }, { k, upm: v.upm, chars });
    console.log(k, Object.keys(out[k]).length, 'pairs');
  }
  fs.writeFileSync(path.join(__dirname, 'kern.json'), JSON.stringify(out));
  const s = out.sx; console.log(['Re','ec','cr','ru','ui','it','te','er','r ',' i','in','n ',' Y','Yo','ou','ur',' P','Po','oc','ck','ke','et'].map(p=>p+':'+(s[p]||0)).join(' '));
  await browser.close();
})();
