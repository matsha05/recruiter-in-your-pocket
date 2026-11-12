import { expect, test } from "@playwright/test";
import { SAMPLE_REPORTS, samplePath } from "../../lib/reports/sample-reports";

// The samples by situation (Nov 11, 2026): each page is a complete report on its own fictional person, says who
// that is, and offers the other samples.

for (const sample of SAMPLE_REPORTS) {
  test(`${samplePath(sample)} shows ${sample.person}'s report and the other samples`, async ({ page }) => {
    await page.goto(samplePath(sample), { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
    const decline = page.getByRole("button", { name: "Decline analytics", exact: true });
    if (await decline.isVisible().catch(() => false)) await decline.click();

    await expect(page.getByTestId("worklist-report")).toBeVisible();
    await expect(page.getByText(`Sample report · ${sample.person} is fictional`)).toBeVisible();
    const switcher = page.getByTestId("sample-switcher");
    await expect(switcher.locator("a, span")).toHaveCount(SAMPLE_REPORTS.length);
    await expect(switcher.locator("[aria-current='page']")).toHaveText(sample.situation);
    for (const other of SAMPLE_REPORTS.filter((entry) => entry !== sample)) {
      await expect(switcher.getByRole("link", { name: other.situation, exact: true })).toHaveAttribute("href", samplePath(other));
    }
    await expect(page.getByTestId("sample-terminal-cta")).toContainText(`That’s ${sample.person}’s. Yours is next.`);
    // The other samples are also linked from the ending's own text, which is what the internal-links gate counts.
    await expect(page.getByTestId("sample-others").getByRole("link")).toHaveCount(SAMPLE_REPORTS.length - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}

test("a sample that doesn't exist is not found", async ({ page }) => {
  const response = await page.goto("/sample-report/no-such-sample", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
});
