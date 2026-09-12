import { expect, test } from "@playwright/test";
import content from "../../components/landing/instrument/content.json";

test("cold startup downloads the artwork once and only the cropped trust marks", async ({ page }) => {
    const images: string[] = [];
    // Routing disables the browser cache, exposing accidental duplicate requests.
    await page.route("**/*", route => route.continue());
    page.on("request", request => { if (request.resourceType() === "image") images.push(request.url()); });
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await expect(page.getByRole("img", { name: "Apple", exact: true })).toBeVisible();
    await instrument.locator('[data-instrument-mode="story"]').click();
    await expect(instrument).toHaveAttribute("data-mode", "story");
    await instrument.getByRole("switch", { name: "Instrument power" }).click();
    expect(images.filter(url => url.includes("/assets/instrument/clean-plate"))).toHaveLength(1);
    expect(images.some(url => url.includes("alpine-selected-reference.png"))).toBe(false);
    expect(images.some(url => url.includes("trust-marks.v1.webp"))).toBe(true);
});

test("hero controls latch, release to Home, and retain the dial view through power", async ({ page }) => {
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await expect(page.locator(".ri-art")).toHaveCount(1);
    const impact = instrument.locator('[data-instrument-mode="impact"]');
    await impact.click();
    await expect(impact).toHaveAttribute("aria-pressed", "true");
    await expect(impact).toHaveAttribute("data-depth", "3.000");
    const dial = instrument.getByRole("slider");
    await dial.focus();
    await page.keyboard.press("End");
    await expect(instrument).toHaveAttribute("data-stage", "next");
    await instrument.getByRole("switch", { name: "Instrument power" }).click();
    await expect(instrument).toHaveAttribute("data-powered", "false");
    await impact.click();
    await expect(instrument).toHaveAttribute("data-powered", "true");
    await expect(instrument).toHaveAttribute("data-stage", "next");
    await expect(impact).toHaveAttribute("aria-pressed", "true");
    await impact.click();
    await expect(instrument).toHaveAttribute("data-mode", "home");
    await expect(impact).toHaveAttribute("data-depth", "0.000");
    await expect(dial).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByText("Trusted by people at", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "A human point of view. Built into every review." })).toBeVisible();
    await expect(page.getByTestId("landing-primary-cta")).toHaveAttribute("href", "/workspace");
});

test("missing prepared button textures preserve the physical controls", async ({ page }) => {
    await page.route("**/assets/instrument/key-materials.v1.webp", route => route.abort());
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    const story = instrument.locator('[data-instrument-mode="story"]');
    await story.click();
    await expect(story).toHaveAttribute("data-depth", "3.000");
    await expect(instrument.locator(".ri-source")).toHaveText(content.modes[0].sourceExcerpt);
    await story.click();
    await expect(instrument).toHaveAttribute("data-mode", "home");
    await expect(story).toHaveAttribute("data-depth", "0.000");
});

test("the simple home example and all nine physical views remain readable", async ({ page }) => {
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await expect(instrument.locator(".ri-source-label")).toHaveText("Before");
    await expect(instrument.locator(".ri-response-label")).toHaveText("After");
    await expect(instrument.locator(".ri-response")).toHaveText(content.home.revision);
    await instrument.locator("summary").filter({ hasText: /^Read at full size/ }).click();
    await expect(instrument.getByRole("group", { name: "Choose a focus" })).toHaveCount(0);
    const feedback = instrument.getByTestId("instrument-readable-feedback");
    await expect(feedback.getByRole("heading")).toHaveText(content.home.revision);
    const dial = instrument.getByRole("slider");
    for (const mode of content.modes) {
        await instrument.locator(`[data-instrument-mode="${mode.id}"]`).click();
        for (const stage of content.stages) {
            await dial.focus();
            await page.keyboard.press("Home");
            if (stage.id === "read") await page.keyboard.press("ArrowRight");
            if (stage.id === "next") await page.keyboard.press("End");
            await expect(instrument).toHaveAttribute("data-stage", stage.id);
            const view = mode.stages[stage.id as keyof typeof mode.stages];
            await expect(feedback.locator("blockquote")).toHaveText(mode.sourceExcerpt);
            if (stage.id === "paper") {
                await expect(feedback.getByRole("heading")).toHaveCount(0);
                await expect(feedback).toContainText(mode.sourceContext);
            } else {
                await expect(feedback.getByRole("heading")).toHaveText(view.title);
                await expect(feedback).toContainText(view.body);
            }
            await expect(instrument.locator(".ri-source")).toHaveText(mode.sourceExcerpt);
            expect(await instrument.locator(".ri-paper").evaluate(el => el.scrollHeight <= el.clientHeight), `${mode.id}/${stage.id} display clipping`).toBe(true);
        }
    }
    await expect(feedback).toContainText(content.sample.jobRequirement.text);
    await instrument.getByRole("switch", { name: "Instrument power" }).click();
    await instrument.locator('[data-instrument-mode="fit"]').click();
    await expect(instrument).toHaveAttribute("data-powered", "true");
});

test("phone controls and reduced motion remain usable", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await instrument.locator('[data-instrument-mode="fit"]').click();
    await expect(instrument.locator('[data-instrument-mode="fit"]')).toHaveAttribute("data-depth", "3.000");
    await instrument.getByRole("slider").focus();
    await page.keyboard.press("End");
    await instrument.locator("summary").filter({ hasText: /^Read at full size/ }).click();
    await expect(instrument.getByTestId("instrument-readable-feedback")).toContainText("Confirm the account segment");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const power = await instrument.getByRole("switch", { name: "Instrument power" }).boundingBox();
    expect(power?.width).toBeGreaterThanOrEqual(44);
    expect(power?.height).toBeGreaterThanOrEqual(44);
});

test("artwork failure keeps the sample and real report action usable", async ({ page }) => {
    await page.route("**/assets/instrument/clean-plate.v1.webp", route => route.abort());
    await page.goto("/");
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "failed");
    await expect(instrument.getByTestId("instrument-stage")).toBeHidden();
    const modes = instrument.getByRole("group", { name: "Choose a focus" });
    await modes.getByRole("button", { name: "Impact", exact: true }).click();
    await instrument.getByRole("radio", { name: "Next move" }).check();
    await expect(instrument.getByTestId("instrument-readable-feedback")).toContainText("32 B2B SaaS accounts");
    await expect(page.getByTestId("landing-primary-cta")).toHaveAttribute("href", "/workspace");
});

test("leaving and returning mounts one clean working instrument", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByTestId("pocket-instrument")).toHaveAttribute("data-status", "ready");
    await page.getByRole("link", { name: "Explore the sample report", exact: true }).click();
    await expect(page).toHaveURL(/\/sample-report$/);
    await expect(page.locator(".ri-art")).toHaveCount(0);
    await page.goBack();
    const instrument = page.getByTestId("pocket-instrument");
    await expect(instrument).toHaveAttribute("data-status", "ready");
    await expect(page.locator(".ri-art")).toHaveCount(1);
    await instrument.locator('[data-instrument-mode="story"]').click();
    await expect(instrument).toHaveAttribute("data-mode", "story");
    expect(errors).toEqual([]);
});
