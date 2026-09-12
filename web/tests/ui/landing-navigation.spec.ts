import { expect, test } from "@playwright/test";

for (const width of [320, 820]) {
    test(`menu section links keep their destination and focus at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        for (const [label, id] of [["How it works", "how-it-works"], ["About", "about"]]) {
            await page.goto("/");
            await page.getByRole("button", { name: "Open navigation" }).click();
            const link = page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: label, exact: true });
            if (id === "about") {
                await link.focus();
                await page.keyboard.press("Enter");
            } else {
                await link.click();
            }
            await expect(page.getByRole("dialog")).toHaveCount(0);
            await expect(page).toHaveURL(new RegExp(`#${id}$`));
            const destination = page.locator(`#${id}`);
            await expect(destination).toBeFocused();
            await expect.poll(async () => (await destination.boundingBox())!.y).toBeLessThanOrEqual(100);
            expect((await destination.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
            expect(await page.evaluate(() => scrollY)).toBeGreaterThan(500);
        }
    });
}

test("dismissing the mobile menu still restores keyboard focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("a section link from another marketing route focuses the landing section", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/sample-report");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "How it works", exact: true }).click();
    await expect(page).toHaveURL(/\/#how-it-works$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const destination = page.locator("#how-it-works");
    await expect(destination).toBeFocused();
    await expect.poll(async () => (await destination.boundingBox())!.y).toBeLessThanOrEqual(100);
    expect((await destination.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
});

test("ordinary mobile navigation moves focus into the destination page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Sample report", exact: true }).click();
    await expect(page).toHaveURL(/\/sample-report$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("#main-content")).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(0);
});
