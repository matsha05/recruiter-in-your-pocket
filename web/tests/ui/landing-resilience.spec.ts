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
    const demo = page.getByTestId("recruiter-view-demo");
    await demo.getByRole("button", { name: "A recruiter’s view", exact: true }).click();
    await expect(demo).toHaveAttribute("data-view", "recruiter");
    await expect(page.getByTestId("landing-primary-cta")).toHaveAttribute("href", "/workspace");
});

test("a failed font leaves the example toggle usable from the keyboard", async ({ page }) => {
    await page.route("**/fonts/schibsted-grotesk/**", route => route.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const demo = page.getByTestId("recruiter-view-demo");
    const recruiter = demo.getByRole("button", { name: "A recruiter’s view", exact: true });
    const yours = demo.getByRole("button", { name: "Your view", exact: true });
    await recruiter.focus();
    await page.keyboard.press("Enter");
    await expect(recruiter).toHaveAttribute("aria-pressed", "true");
    await expect(demo.getByText("Critical Miss", { exact: true })).toBeVisible();
    await yours.focus();
    await page.keyboard.press("Enter");
    await expect(demo).toHaveAttribute("data-view", "you");
    await expect(demo.getByText("Critical Miss", { exact: true })).toHaveCount(0);
});

test("the example shows the recruiter's read once it scrolls into view, unless the visitor already chose", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
    const demo = page.getByTestId("recruiter-view-demo");
    await expect(demo).toHaveAttribute("data-view", "you");
    await demo.scrollIntoViewIfNeeded();
    await expect(demo).toHaveAttribute("data-view", "recruiter");
    await demo.getByRole("button", { name: "Your view", exact: true }).click();
    await page.waitForTimeout(1000);
    await expect(demo).toHaveAttribute("data-view", "you");
});
