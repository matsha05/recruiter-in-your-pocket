import { expect, test } from "@playwright/test";

const headline = "244 people applied for the job you wanted.";

test("an unavailable saved theme does not take down the landing page", async ({ page }) => {
    await page.addInitScript(() => {
        const setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key: string, value: string) {
            if (key === "theme") throw new DOMException("Theme persistence is disabled", "SecurityError");
            return setItem.call(this, key, value);
        };
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    await expect(page.getByRole("heading", { level: 1, name: headline })).toBeVisible();
    await expect(page.getByTestId("landing-pile")).toBeVisible();
    await expect(page.getByTestId("landing-primary-cta")).toHaveAttribute("href", "/workspace");
});

test("a failed font leaves the main action usable from the keyboard", async ({ page }) => {
    await page.route("**/fonts/schibsted-grotesk/**", route => route.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByTestId("landing-primary-cta").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/workspace(?:[/?#]|$)/);
});

test("the story reads in order: the pile, the read, the note, what we look for, the re-check, the founder, the close", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const order = await page.evaluate(() => ["#hero-title", "#read-title", "#example-title", "#what-we-look-for", "#progress-title", "#founder-note", "#close-title"]
        .map((selector) => document.querySelector(selector)!.getBoundingClientRect().top + scrollY));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // The pile is one image to assistive technology, with its count in the label; the digit flaps never reach it as text.
    await expect(page.getByTestId("landing-pile")).toHaveAttribute("aria-label", /244 small sheets/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(headline);
});

test("reduced motion shows the pile, the decision and the ending already in place", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    expect(await page.getByTestId("landing-pile").locator("span").first().evaluate((sheet) => getComputedStyle(sheet).animationName)).toBe("none");
    const read = page.getByTestId("landing-read");
    await expect(read).toHaveAttribute("data-on", "true");
    await expect(read.getByText("Nobody tells you why.", { exact: true })).toBeVisible();
    await context.close();
});

test("the read starts when the visitor reaches it and ends on the decision", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const read = page.getByTestId("landing-read");
    // Nothing has started while the read is below the fold.
    await expect(read).not.toHaveAttribute("data-lit", "true");
    await read.scrollIntoViewIfNeeded();
    await expect(read).toHaveAttribute("data-lit", "true");
    // Five seconds of pen, then the two choices and the ending.
    await expect(read).toHaveAttribute("data-on", "true", { timeout: 15_000 });
    await expect(read.getByText("Reject", { exact: true })).toBeVisible();
    await expect(read.getByText("We do, before you apply for the next one.", { exact: true })).toBeVisible();
    await expect(read.getByRole("link", { name: "Get your free report" })).toHaveAttribute("href", "/workspace");
});

test("the note Jordan never saw is marked when its clipping is in view", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const clipping = page.locator("#how-it-works figure").first();
    await expect(clipping).not.toHaveAttribute("data-marked", "true");
    await clipping.scrollIntoViewIfNeeded();
    await expect(clipping).toHaveAttribute("data-marked", "true");
    await expect(clipping.getByText("What did Jordan look for, and what changed?", { exact: false })).toBeVisible();
});
