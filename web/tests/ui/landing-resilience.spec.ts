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

test("the story reads in order: the hidden verdict, the worked example, the silence, what we look for, then the re-check", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const order = await page.evaluate(() => ["#hero-title", "#example-title", "#silence-title", "#what-we-look-for", "#progress-title"]
        .map((selector) => document.querySelector(selector)!.getBoundingClientRect().top + scrollY));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // The note is meant to be unreadable; its words never reach assistive technology as content.
    await expect(page.getByTestId("landing-verdict-art")).toHaveAttribute("aria-hidden", "true");
});

test("reduced motion shows the note already in place", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("/");
    const note = page.getByTestId("landing-verdict-art").getByText("Not moving forward", { exact: true });
    await expect(note).toBeVisible();
    expect(await note.evaluate((element) => getComputedStyle(element.closest("p")!.parentElement!).animationName)).toBe("none");
    await context.close();
});

test("the reviewer note clears once the visitor scrolls into the story", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const card = page.getByTestId("landing-verdict-art").locator(":scope > div").last();
    const note = page.getByTestId("landing-verdict-art").getByText("Is Jordan after another customer success role?", { exact: false });
    await expect.poll(() => note.evaluate((element) => getComputedStyle(element).filter)).toContain("blur");
    await page.mouse.move(700, 450);
    await page.mouse.wheel(0, 160);
    await expect(card).toHaveAttribute("data-revealed", "true");
    await expect.poll(() => note.evaluate((element) => getComputedStyle(element).filter)).toBe("none");
});

test("on a phone the note waits until its card is in view", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const art = page.getByTestId("landing-verdict-art");
    await expect(art.locator("[data-revealed]")).toHaveCount(0);
    await art.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 120);
    await expect(art.locator("[data-revealed='true']")).toHaveCount(1);
});
