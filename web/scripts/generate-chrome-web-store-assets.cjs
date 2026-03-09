const fs = require("fs");
const path = require("path");

const { chromium } = require("playwright");
const { startNextServer } = require(path.resolve(process.cwd(), "..", "scripts", "next_server"));

const OUTPUT_DIR = path.resolve(process.cwd(), "public", "assets", "chrome-web-store");
const ASSETS = [
  "popup-jobs",
  "popup-auth",
  "workspace-return",
  "install-disclosure",
  "capture-context",
  "promo-tile",
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
    await page.waitForTimeout(500);

    for (const assetId of ASSETS) {
      const locator = page.locator(`[data-store-asset="${assetId}"]`);
      await locator.waitFor({ state: "visible" });
      await locator.screenshot({
        path: path.join(OUTPUT_DIR, `${assetId}.png`),
        type: "png",
      });
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      assets: ASSETS.map((assetId) => ({
        id: assetId,
        path: `/assets/chrome-web-store/${assetId}.png`,
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
