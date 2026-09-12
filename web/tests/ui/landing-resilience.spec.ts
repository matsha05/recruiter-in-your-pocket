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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("You did the work.");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await instrument.locator('[data-instrument-mode="story"]').click();
    await expect(instrument).toHaveAttribute("data-mode", "story");
    await expect(page.getByTestId("landing-primary-cta")).toHaveAttribute("href", "/workspace");
});

test("a failed font leaves the physical keys, dial, and power usable", async ({ page }) => {
    await page.route("**/fonts/instrument-sans/**", route => route.abort());
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await instrument.locator('[data-instrument-mode="impact"]').click();
    await instrument.getByRole("slider").focus();
    await page.keyboard.press("End");
    await expect(instrument).toHaveAttribute("data-stage", "next");
    await instrument.getByRole("switch", { name: "Instrument power" }).click();
    await expect(instrument).toHaveAttribute("data-powered", "false");
    await instrument.locator('[data-instrument-mode="impact"]').click();
    await expect(instrument).toHaveAttribute("data-powered", "true");
    await expect(instrument).toHaveAttribute("data-stage", "next");
});

test("a stalled texture optimization cannot block controls or reset them when it arrives", async ({ page }) => {
    let releaseAtlas!: () => void;
    const atlasGate = new Promise<void>(resolve => { releaseAtlas = resolve; });
    await page.route("**/assets/instrument/key-materials.v1.webp", async route => {
        await atlasGate;
        await route.continue();
    });
    try {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        const instrument = page.getByTestId("pocket-instrument");
        await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
        await expect(instrument.locator("img")).toHaveJSProperty("complete", true);
        // The independent atlas request remains held until after interaction.
        await expect(instrument).toHaveAttribute("data-status", "ready", { timeout: 3_000 });
        const mountedArtwork = await instrument.locator(".ri-art").elementHandle();
        await instrument.locator('[data-instrument-mode="fit"]').click();
        await instrument.getByRole("slider").focus();
        await page.keyboard.press("End");
        await instrument.getByRole("switch", { name: "Instrument power" }).click();
        const delivered = page.waitForResponse("**/assets/instrument/key-materials.v1.webp");
        releaseAtlas();
        await delivered;
        await expect.poll(() => page.evaluate(() => performance.getEntriesByType("resource")
            .some(entry => entry.name.includes("/assets/instrument/key-materials.v1.webp")))).toBe(true);
        expect(await mountedArtwork?.evaluate(element => element.isConnected)).toBe(true);
        await expect(page.locator(".ri-art")).toHaveCount(1);
        await expect(instrument).toHaveAttribute("data-mode", "fit");
        await expect(instrument).toHaveAttribute("data-stage", "next");
        await expect(instrument).toHaveAttribute("data-powered", "false");
        await instrument.getByRole("switch", { name: "Instrument power" }).click();
        await expect(instrument).toHaveAttribute("data-stage", "next");
    } finally {
        releaseAtlas();
    }
});

test("leaving during artwork loading does not mount controls on the next page", async ({ page }) => {
    let releaseArtwork!: () => void;
    const artworkGate = new Promise<void>(resolve => { releaseArtwork = resolve; });
    await page.route("**/assets/instrument/clean-plate.v1.webp", async route => {
        await artworkGate;
        // A route may already be cancelled by the time client navigation ends.
        await route.continue().catch(() => {});
    });
    try {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
        await expect(page.getByTestId("pocket-instrument")).toHaveAttribute("data-status", "loading");
        await page.getByRole("link", { name: "Sample report", exact: true }).first().click();
        await expect(page).toHaveURL(/\/sample-report$/);
        releaseArtwork();
        await expect(page.locator(".ri-art")).toHaveCount(0);
        await page.goBack();
        await expect(page.getByTestId("pocket-instrument")).toHaveAttribute("data-status", "ready");
        await expect(page.locator(".ri-art")).toHaveCount(1);
    } finally {
        releaseArtwork();
    }
});
