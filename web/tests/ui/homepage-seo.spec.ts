import { expect, test } from "@playwright/test";

const homepageDescription = "Get a free recruiter-style first read of your resume: the exact lines that raise questions and up to three prioritized changes to make before you apply.";

test.describe("homepage feedback and SEO contract", () => {
  test("the homepage explains the report and keeps the offer tool in the footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "You did the work.Let's make sure they see it.",
    );
    await expect(homepage).toContainText("Recruiter feedback, before you apply.");
    await expect(homepage).toContainText(
      "Upload or paste your resume. See what it makes clear, where it leaves questions, and up to three changes to make first.",
    );

    await expect(homepage.getByTestId("landing-primary-cta")).toHaveText("Get my free report");
    await expect(homepage.getByTestId("landing-primary-cta")).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(page.getByRole("link", { name: "See an example report", exact: true })).toHaveAttribute(
      "href",
      "/sample-report",
    );
    await expect(homepage).toContainText("Your first complete report is free. No card required.");
    const freeLimits = homepage.locator("details").filter({ hasText: "Free report limits" });
    await expect(freeLimits).not.toHaveAttribute("open", "");
    await freeLimits.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(freeLimits).toHaveAttribute("open", "");
    await expect(freeLimits.locator("p")).toBeVisible();
    await expect(freeLimits).toContainText("Repeat use across browsers or shared networks");
    await expect(freeLimits).toContainText("Daily capacity limits apply");
    await expect(homepage).not.toContainText("per calendar month");
    await expect(homepage).toContainText(
      "AI feedback shaped by Matt Shaw's 14 years in recruiting.",
    );
    await expect(homepage).not.toContainText(
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

    const calculator = page.locator("footer").getByRole("link", { name: "Offer calculator", exact: true });
    await expect(calculator).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comparing job offers?" })).toHaveCount(0);
    await expect(calculator).toHaveAttribute("href", "/resources/tools/comp-calculator");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.recruiterinyourpocket.com",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", homepageDescription);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", homepageDescription);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", homepageDescription);
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
    expect(applicationData).toMatchObject({ description: homepageDescription });
    expect(JSON.stringify(structuredData)).not.toContain("the three most important changes");
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

  test("terms and FAQ state the anonymous calendar-month eligibility boundary", async ({ page }) => {
    const assertAnonymousBoundary = async () => {
      const main = page.getByRole("main");
      await expect(main).toContainText("Your first complete report is free. No card required.");
      await expect(main).toContainText("Anonymous use is limited to one free report per calendar month.");
      await expect(main).toContainText("Repeat use across browsers or shared networks can affect eligibility");
      await expect(main).toContainText("Daily capacity limits apply");
    };

    await page.goto("/terms");
    await assertAnonymousBoundary();

    await page.goto("/faq");
    await page.getByRole("button", { name: "Is the first report really free?", exact: true }).click();
    await assertAnonymousBoundary();
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
