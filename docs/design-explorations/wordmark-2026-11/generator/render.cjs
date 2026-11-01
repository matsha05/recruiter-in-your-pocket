// Full-page renders of board.html (1440 and 390) and board-c-favicons.html (1440 at 2x). Usage: node render.cjs [folder] (defaults to the folder above this one)
const path = require('path');
const { W } = require('./lib.cjs');
const { chromium } = require(W + '/node_modules/playwright');
const DIR = path.resolve(process.argv[2] || path.join(__dirname, '..'));
(async () => {
  const browser = await chromium.launch();
  for (const [file, out, width, dpr] of [['board.html', 'board-1440.png', 1440, 1], ['board.html', 'board-390.png', 390, 2], ['board-c-favicons.html', 'board-c-favicons.png', 1440, 2]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: dpr });
    await page.goto('file://' + path.join(DIR, file));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) console.warn(file + ' at ' + width + ' px: horizontal overflow of ' + overflow + ' px');
    await page.screenshot({ path: path.join(DIR, out), fullPage: true });
    await page.close();
  }
  await browser.close();
  console.log('rendered board-1440.png, board-390.png and board-c-favicons.png');
})();
