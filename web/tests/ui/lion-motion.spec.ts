import { expect, test, type Locator, type Page } from "@playwright/test";

const desktop = { width: 1536, height: 1200 };
const roomAsset = "/assets/characters/pocket-lion-room.webp";
const originalSize = { width: 1536, height: 1024 };

// These regions refer to the approved artwork, not shader coordinates. The
// resume crop contains real lettering and sits clear of the head and hands.
const regions = {
  head: { x: 930, y: 140, width: 300, height: 335 },
  resume: { x: 1130, y: 560, width: 210, height: 260 },
} as const;

test.use({ viewport: desktop, contextOptions: { reducedMotion: "no-preference" } });

async function openLanding(page: Page) {
  await page.mouse.move(0, desktop.height - 1);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.getByTestId("lion-hero-still").evaluate((image: HTMLImageElement) =>
    image.complete && image.naturalWidth > 0,
  )).toBe(true);
}

async function regionScreenshot(page: Page, scene: Locator, region: keyof typeof regions) {
  const bounds = await scene.boundingBox();
  if (!bounds) throw new Error("Lion scene has no rendered bounds");
  const crop = regions[region];
  const scaleX = bounds.width / originalSize.width;
  const scaleY = bounds.height / originalSize.height;
  return page.screenshot({
    clip: {
      x: Math.round(bounds.x + crop.x * scaleX),
      y: Math.round(bounds.y + crop.y * scaleY),
      width: Math.round(crop.width * scaleX),
      height: Math.round(crop.height * scaleY),
    },
    scale: "css",
    caret: "hide",
  });
}

async function moveAcrossComposition(page: Page, side: "left" | "right") {
  const bounds = await page.getByTestId("lion-hero-composition").boundingBox();
  if (!bounds) throw new Error("Lion composition has no rendered bounds");
  await page.mouse.move(
    bounds.x + bounds.width * (side === "left" ? 0.08 : 0.92),
    bounds.y + bounds.height * 0.28,
    { steps: 8 },
  );
}

async function stableHeadScreenshot(page: Page, scene: Locator) {
  let previous = await regionScreenshot(page, scene, "head");
  let consecutiveMatches = 0;
  await expect.poll(async () => {
    const current = await regionScreenshot(page, scene, "head");
    consecutiveMatches = current.equals(previous) ? consecutiveMatches + 1 : 0;
    previous = current;
    return consecutiveMatches;
  }, { message: "The head must settle when the pointer stops" }).toBeGreaterThanOrEqual(3);
  return previous;
}

async function expectStillFallback(page: Page, state: "still" | "failed") {
  await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", state);
  const still = page.getByTestId("lion-hero-still");
  await expect(still).toBeVisible();
  await expect(still).toHaveCSS("opacity", "1");
  await expect(still).toHaveAttribute("alt", /lion.*resume/i);
  await expect.poll(async () => {
    const canvas = page.getByTestId("lion-hero-canvas");
    if (await canvas.count() === 0) return true;
    return canvas.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;
    });
  }).toBe(true);
  await expect(page.getByTestId("landing-primary-cta")).toHaveAttribute("href", "/workspace");
  await page.getByTestId("landing-primary-cta").click({ trial: true });
}

test("the lion responds to the pointer while the resume stays fixed, then returns to rest", async ({ page }, testInfo) => {
  await openLanding(page);
  const scene = page.getByTestId("lion-hero-scene");
  await expect(scene).toHaveAttribute("data-motion-state", "ready", { timeout: 30_000 });
  await expect(page.getByTestId("lion-hero-canvas")).toHaveAttribute("aria-hidden", "true");

  const neutralHead = await regionScreenshot(page, scene, "head");
  const neutralResume = await regionScreenshot(page, scene, "resume");
  await moveAcrossComposition(page, "right");
  await expect.poll(async () => !(await regionScreenshot(page, scene, "head")).equals(neutralHead), {
    message: "Pointer movement must visibly change the lion's head",
  }).toBe(true);
  const rightHead = await stableHeadScreenshot(page, scene);
  expect(rightHead.equals(neutralHead), "The settled pointer pose must differ from the neutral pose").toBe(false);
  expect((await regionScreenshot(page, scene, "resume")).equals(neutralResume), "Resume lettering must not move with the head").toBe(true);

  await moveAcrossComposition(page, "left");
  await expect.poll(async () => !(await regionScreenshot(page, scene, "head")).equals(rightHead), {
    message: "The lion must respond to a changed pointer direction",
  }).toBe(true);
  const leftHead = await stableHeadScreenshot(page, scene);
  expect(leftHead.equals(rightHead), "Opposite pointer positions must produce different settled poses").toBe(false);
  expect((await regionScreenshot(page, scene, "resume")).equals(neutralResume), "The opposite pointer direction must also leave the resume fixed").toBe(true);

  await page.mouse.move(0, desktop.height - 1);
  let consecutiveRestFrames = 0;
  await expect.poll(async () => {
    const atRest = (await regionScreenshot(page, scene, "head")).equals(neutralHead);
    consecutiveRestFrames = atRest ? consecutiveRestFrames + 1 : 0;
    return consecutiveRestFrames;
  }, { message: "Leaving the composition must return the head to its original, stable pose" }).toBeGreaterThanOrEqual(3);
  expect((await regionScreenshot(page, scene, "resume")).equals(neutralResume)).toBe(true);

  await testInfo.attach("head-at-rest", { body: neutralHead, contentType: "image/png" });
  await testInfo.attach("head-following-pointer", { body: rightHead, contentType: "image/png" });
  await testInfo.attach("unchanged-resume", { body: neutralResume, contentType: "image/png" });
});

test("reduced motion keeps the approved still and does not fetch the motion-only artwork", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: string[] = [];
  page.on("request", (request) => { if (request.url().includes(roomAsset)) requests.push(request.url()); });
  await openLanding(page);
  await expectStillFallback(page, "still");
  const scene = page.getByTestId("lion-hero-scene");
  const head = await regionScreenshot(page, scene, "head");
  await moveAcrossComposition(page, "right");
  expect((await regionScreenshot(page, scene, "head")).equals(head)).toBe(true);
  expect(requests).toEqual([]);
});

test("turning on reduced motion restores the still after the interactive scene has loaded", async ({ page }) => {
  await openLanding(page);
  await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", "ready", { timeout: 30_000 });
  await moveAcrossComposition(page, "right");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectStillFallback(page, "still");
});

test("a failed motion artwork request leaves the still and report action usable", async ({ page }) => {
  await page.route(`**${roomAsset}*`, (route) => route.abort("failed"));
  await openLanding(page);
  await expectStillFallback(page, "failed");
});

test("unavailable WebGL leaves the still and report action usable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, options?: unknown) {
      if (["webgl", "webgl2", "experimental-webgl"].includes(contextId)) return null;
      return Reflect.apply(original, this, [contextId, options]);
    } as HTMLCanvasElement["getContext"];
  });
  await openLanding(page);
  await expectStillFallback(page, "failed");
});

test("the hero and header report links remain usable with motion enabled", async ({ page }) => {
  await openLanding(page);
  await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", "ready", { timeout: 30_000 });
  const headerAction = page.locator(".site-header").getByRole("link", { name: "Get your free report", exact: true });
  await expect(headerAction).toHaveAttribute("href", "/workspace");
  await headerAction.click({ trial: true });
  await page.getByTestId("landing-primary-cta").click();
  await expect(page).toHaveURL(/\/workspace(?:[/?#]|$)/);
});

test("losing a running graphics context restores the approved still", async ({ page }) => {
  await openLanding(page);
  await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", "ready", { timeout: 30_000 });
  await moveAcrossComposition(page, "right");
  const lost = await page.getByTestId("lion-hero-canvas").evaluate((canvas: HTMLCanvasElement) => {
    const extension = canvas.getContext("webgl")?.getExtension("WEBGL_lose_context");
    if (!extension) return false;
    extension.loseContext();
    return true;
  });
  expect(lost, "The browser must exercise a real graphics-context loss").toBe(true);
  await expectStillFallback(page, "failed");
});

test("leaving during a slow motion load preserves the still and recovers on return", async ({ page }) => {
  let releaseRoom!: () => void;
  const roomGate = new Promise<void>((resolve) => { releaseRoom = resolve; });
  let roomRequested = false;
  await page.route(`**${roomAsset}*`, async (route) => {
    roomRequested = true;
    await roomGate;
    await route.continue();
  });
  try {
    await openLanding(page);
    await expect.poll(() => roomRequested).toBe(true);
    await page.getByRole("navigation", { name: "Footer navigation" }).scrollIntoViewIfNeeded();
    await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", "still");
    releaseRoom();
    await page.getByTestId("lion-hero-composition").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("lion-hero-scene")).toHaveAttribute("data-motion-state", "ready", { timeout: 30_000 });
    await expect(page.getByTestId("lion-hero-still")).toBeVisible();
    await page.getByTestId("landing-primary-cta").click({ trial: true });
  } finally {
    releaseRoom();
  }
});

for (const device of [
  { name: "touch-sized landing", viewport: { width: 390, height: 844 }, hasTouch: true },
  { name: "900px pointer landing", viewport: { width: 900, height: 1200 }, hasTouch: false },
  { name: "wide touch landing", viewport: desktop, hasTouch: true },
]) {
  test.describe(device.name, () => {
    test.use({ viewport: device.viewport, hasTouch: device.hasTouch });

    test("shows the still fallback without requesting motion-only artwork", async ({ page }) => {
      const requests: string[] = [];
      page.on("request", (request) => { if (request.url().includes(roomAsset)) requests.push(request.url()); });
      await openLanding(page);
      await expectStillFallback(page, "still");
      expect(requests).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
