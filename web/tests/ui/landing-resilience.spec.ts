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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("They called someone back. It wasn’t you.");
    await expect(page.getByTestId("landing-verdict-art")).toBeVisible();
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

test("the story reads in order: the hidden verdict, the silence, one read, then what we look for", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const order = await page.evaluate(() => ["#hero-title", "#silence-title", "#one-sentence-title", "#how-it-works"]
        .map((selector) => document.querySelector(selector)!.getBoundingClientRect().top + scrollY));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // The note is meant to be unreadable; its words never reach assistive technology as content.
    await expect(page.getByTestId("landing-verdict-art")).toHaveAttribute("aria-hidden", "true");
});

test("reduced motion shows the note already in place", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    const note = page.getByTestId("landing-verdict-art").getByText("Recruiter’s note", { exact: true });
    await expect(note).toBeVisible();
    expect(await note.evaluate((element) => getComputedStyle(element.parentElement!).animationName)).toBe("none");
    await context.close();
});
