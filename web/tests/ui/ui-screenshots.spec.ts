import fs from "fs";
import path from "path";

import { test } from "@playwright/test";

const screenshotsDir = path.join(process.cwd(), "test-results", "screenshots");

const pages = [
  {
    name: "home",
    path: "/",
    waitFor: "text=See what recruiters see.",
  },
  {
    name: "workspace-empty",
    path: "/workspace",
    waitFor: "text=This is what they see.",
  },
  {
    name: "workspace-sample",
    path: "/workspace?sample=true",
    waitFor: "#section-first-impression",
  },
  {
    name: "workspace-linkedin",
    path: "/workspace?mode=linkedin",
    waitFor: "text=3 seconds on your LinkedIn profile.",
  },
  {
    name: "research",
    path: "/research",
    waitFor: "text=The Hiring Playbook",
  },
];

test.describe("ui screenshots", () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  });

  for (const pageSpec of pages) {
    test(pageSpec.name, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await page.goto(pageSpec.path, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(pageSpec.waitFor, { timeout: 30_000 });
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: path.join(screenshotsDir, `${pageSpec.name}.png`),
        fullPage: true,
      });
    });
  }
});
