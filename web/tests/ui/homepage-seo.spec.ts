import { expect, test } from "@playwright/test";

test.describe("homepage feedback and SEO contract", () => {
  test("the active homepage explains the review, founder, AI role, and free offer tool", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "You did the work.Let's make sure they see it.",
    );
    await expect(homepage).toContainText(
      "Get a recruiter's first impression, see the exact résumé lines that raise questions, and learn which changes matter most before you apply.",
    );

    await expect(page.getByRole("link", { name: "Get my free résumé review", exact: true }).first()).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(page.getByRole("link", { name: "See an example report", exact: true })).toHaveAttribute(
      "href",
      "/workspace?sample=1",
    );
    await expect(homepage).toContainText("First report free. No account required. No subscription.");
    await expect(homepage).toContainText(
      "AI-powered feedback, shaped by Matt Shaw's 14 years of real recruiting experience.",
    );

    const founder = page.getByRole("heading", { level: 2, name: "Built by Matt Shaw." });
    await expect(founder).toBeVisible();
    await expect(page.getByText(/Matt does not personally review every submission/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "View Matt's LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/mattrshaw",
    );

    const calculator = page.getByRole("link", { name: "Compare offers for free" });
    await expect(page.getByRole("heading", { level: 2, name: "Comparing job offers?" })).toBeVisible();
    await expect(calculator).toHaveAttribute("href", "/resources/tools/comp-calculator");
  });

  test("the sitemap publishes the calculator, omits the workspace, and avoids synthetic timestamps", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    expect(xml).toContain(
      "<loc>https://www.recruiterinyourpocket.com/resources/tools/comp-calculator</loc>",
    );
    expect(xml).not.toContain("<loc>https://www.recruiterinyourpocket.com/workspace</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
});
