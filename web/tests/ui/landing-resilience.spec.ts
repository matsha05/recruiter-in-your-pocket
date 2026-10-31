import { expect, test } from "@playwright/test";

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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("See what a recruiter sees.");
    await expect(page.getByTestId("landing-pile").getByText("Critical Miss", { exact: true })).toBeVisible();
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

test("the header sits on the ink opening until the hero scrolls away", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const header = page.locator("header.site-header");
    await expect(header).toHaveAttribute("data-tone", "ink");
    await expect(page.locator("html")).not.toHaveAttribute("data-header-solid", "true");
    // Read on until the next section reaches the top, the way a visitor scrolls past the opening.
    await page.evaluate(() => scrollTo(0, document.querySelector("#how-it-works")!.getBoundingClientRect().top + scrollY));
    await expect(page.locator("html")).toHaveAttribute("data-header-solid", "true");
    await page.evaluate(() => scrollTo(0, 0));
    await expect(page.locator("html")).not.toHaveAttribute("data-header-solid", "true");
    // Other pages never get the ink header.
    await page.goto("/pricing");
    await expect(page.locator("header.site-header")).not.toHaveAttribute("data-tone", "ink");
});

test("reduced motion shows the finished pile without animating it", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    const marked = page.getByTestId("landing-pile").getByText("Introduced monthly renewal-risk reviews across the portfolio", { exact: true });
    await expect(marked).toBeVisible();
    expect(await marked.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    await context.close();
});
