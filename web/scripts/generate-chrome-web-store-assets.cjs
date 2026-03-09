const fs = require("fs");
const path = require("path");

const { chromium } = require("playwright");
const { startNextServer } = require(path.resolve(process.cwd(), "..", "scripts", "next_server"));

const OUTPUT_DIR = path.resolve(process.cwd(), "public", "assets", "chrome-web-store");
const ASSETS = [
  { id: "popup-jobs", width: 1280, height: 800 },
  { id: "popup-auth", width: 1280, height: 800 },
  { id: "workspace-return", width: 1280, height: 800 },
  { id: "install-disclosure", width: 1280, height: 800 },
  { id: "capture-context", width: 1280, height: 800 },
  { id: "promo-tile", width: 440, height: 280 },
];

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  process.env.ALLOW_INTERNAL_PAGES = process.env.ALLOW_INTERNAL_PAGES || "true";
  process.env.FORCE_NEXT_BUILD = process.env.FORCE_NEXT_BUILD || "1";
  const next = await startNextServer({ ensureBuild: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 1,
    });

    await page.goto(`${next.baseUrl}/internal/chrome-web-store-assets`, {
      waitUntil: "networkidle",
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({
      width: 1600,
      height: Math.min(Math.max(docHeight + 200, 1200), 9000),
    });
    await page.waitForTimeout(500);

    for (const asset of ASSETS) {
      const { id: assetId, width, height } = asset;
      const locator = page.locator(`[data-store-asset="${assetId}"]`);
      await locator.waitFor({ state: "visible" });
      const box = await locator.boundingBox();
      if (!box) {
        throw new Error(`Could not resolve bounding box for ${assetId}`);
      }
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${assetId}.png`),
        type: "png",
        clip: {
          x: Math.floor(box.x),
          y: Math.floor(box.y),
          width,
          height,
        },
      });
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      assets: ASSETS.map(({ id }) => ({
        id,
        path: `/assets/chrome-web-store/${id}.png`,
      })),
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
      "utf8",
    );
  } finally {
    await browser.close();
    await next.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
