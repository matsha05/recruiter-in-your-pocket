import { expect, test } from "@playwright/test";

test.describe("homepage feedback and SEO contract", () => {
  test("the active homepage explains the review, founder, AI role, and free offer tool", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "You did the work.Let's make sure they see it.",
    );
    await expect(homepage).toContainText("Recruiter feedback, before you apply.");
    await expect(homepage).toContainText(
      "Get a recruiter's first impression, see the exact résumé lines that raise questions, and learn the three most important changes to make before you apply.",
    );

    await expect(page.getByRole("link", { name: "Get my free résumé review", exact: true }).first()).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(page.getByRole("link", { name: "See an example report", exact: true })).toHaveAttribute(
      "href",
      "/sample-report",
    );
    await expect(homepage).toContainText("First report free. No account required. No subscription.");
    await expect(homepage).toContainText(
      "AI-powered feedback, informed by Matt Shaw's 14 years of real recruiting experience.",
    );
    await expect(homepage).toContainText(
      "Real recruiting judgment, honest feedback, factual rewrites, and no subscription trap.",
    );

    const founder = page.getByRole("heading", { level: 2, name: "Built by Matt Shaw." });
    await expect(founder).toBeVisible();
    await expect(page.getByAltText("Matt Shaw, founder of Recruiter in Your Pocket")).toBeVisible();
    await expect(homepage).toContainText("14 years in recruiting and hiring.");
    await expect(page.getByText(/Matt does not personally review every submission/i)).toBeVisible();
    await expect(homepage).toContainText(
      "no current or former employer sponsors or endorses it",
    );
    await expect(page.getByRole("link", { name: "View my LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/mattrshaw",
    );

    const calculator = page.getByRole("link", { name: "Compare offers for free" });
    await expect(page.getByRole("heading", { level: 2, name: "Comparing job offers?" })).toBeVisible();
    await expect(homepage).toContainText(
      "See salary, bonus, equity, and vesting on the same four-year timeline.",
    );
    await expect(calculator).toHaveAttribute("href", "/resources/tools/comp-calculator");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.recruiterinyourpocket.com",
    );
    const structuredData = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent() || "{}",
    );
    const graph = structuredData["@graph"] as Array<Record<string, unknown>>;
    const founderData = graph.find((entry) => entry["@type"] === "Person");
    const applicationData = graph.find((entry) => entry["@type"] === "SoftwareApplication");
    expect(founderData).toMatchObject({
      name: "Matt Shaw",
      sameAs: ["https://www.linkedin.com/in/mattrshaw"],
    });
    expect(applicationData?.offers).toEqual(expect.arrayContaining([
      expect.objectContaining({ price: "0" }),
      expect.objectContaining({
        price: "29",
        description: expect.stringContaining("over 30 days"),
      }),
    ]));
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /opengraph-image\?v=20260729/,
    );
    await expect(homepage).toContainText(
      "Limit: the experiment took place in an online labor market.",
    );
    await expect(page.getByRole("link", { name: /Wiles, Munyikwa & Horton/ })).toHaveAttribute(
      "href",
      "https://www.nber.org/papers/w30886",
    );
  });

  test("pricing and sample publish canonical social previews", async ({ page }) => {
    for (const path of ["/pricing", "/sample-report"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://www.recruiterinyourpocket.com${path}`,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /opengraph-image\?v=20260730/,
      );
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        /opengraph-image\?v=20260730/,
      );
    }
  });

  test("the sitemap publishes the calculator, omits the workspace, and avoids synthetic timestamps", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    expect(xml).toContain(
      "<loc>https://www.recruiterinyourpocket.com/resources/tools/comp-calculator</loc>",
    );
    expect(xml).toContain(
      "<loc>https://www.recruiterinyourpocket.com/sample-report</loc>",
    );
    expect(xml).not.toContain("<loc>https://www.recruiterinyourpocket.com/workspace</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
});
