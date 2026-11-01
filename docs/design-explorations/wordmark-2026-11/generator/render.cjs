// Full-page renders of board.html. Usage: node render.cjs [folder] (defaults to the folder above this one)
const path = require('path');
const { W } = require('./lib.cjs');
const { chromium } = require(W + '/node_modules/playwright');
const DIR = path.resolve(process.argv[2] || path.join(__dirname, '..'));
(async () => {
  const browser = await chromium.launch();
  for (const [width, dpr] of [[1440, 1], [390, 2]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: dpr });
    await page.goto('file://' + path.join(DIR, 'board.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) console.warn(width + ' px: horizontal overflow of ' + overflow + ' px');
    await page.screenshot({ path: path.join(DIR, 'board-' + width + '.png'), fullPage: true });
    await page.close();
  }
  await browser.close();
  console.log('rendered board-1440.png and board-390.png');
})();
