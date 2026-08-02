import { expect, test } from "@playwright/test";

const homepageDescription = "Get a free recruiter-style first read of your résumé: the exact lines that raise questions and up to three prioritized changes to make before you apply.";

test.describe("homepage feedback and SEO contract", () => {
  test("the active homepage explains the review, founder, AI role, and free offer tool", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    await expect(page.getByRole("heading", {
      level: 1,
      name: "You did the work. Let's make sure they see it.",
    })).toBeVisible();
    await expect(homepage).toContainText("Recruiter feedback, before you apply.");
    await expect(homepage).toContainText(
      "Upload or paste your résumé. Your free first-read report shows what lands, the exact lines that raise questions, and up to three prioritized changes to make before you apply.",
    );

    const primaryCta = page.getByTestId("landing-primary-cta");
    await expect(primaryCta).toHaveText("Get my free résumé review");
    await expect(primaryCta).toHaveAttribute("href", "/workspace");
    await expect(page.getByRole("link", { name: "See an example report", exact: true })).toHaveAttribute(
      "href",
      "/sample-report",
    );
    await expect(homepage).toContainText("Your first complete report is free—no card.");
    await expect(homepage).toContainText("repeat use across browsers or shared networks");
    await expect(homepage).toContainText("daily beta capacity");
    await expect(homepage).not.toContainText("monthly eligibility window");
    await expect(homepage).not.toContainText("per calendar month");
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
      await expect(main).toContainText("Your first complete report is free—no card.");
      await expect(main).toContainText("For anonymous use, there is one free report per calendar month.");
      await expect(main).toContainText("Repeat use across browsers or shared networks can affect eligibility");
      await expect(main).toContainText("daily beta capacity applies");
    };

    await page.goto("/terms");
    await assertAnonymousBoundary();

    await page.goto("/faq");
    await page.getByRole("button", { name: "Is the first report really free?", exact: true }).click();
    await assertAnonymousBoundary();
  });

  test("keeps the free résumé review action and first-read proof in the opening mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const primaryCta = page.getByTestId("landing-primary-cta");
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveText("Get my free résumé review");

    const openingLayout = await page.locator("[data-visual-anchor='landing-home']").evaluate((homepage) => {
      const cta = homepage.querySelector<HTMLElement>("[data-testid='landing-primary-cta']");
      const proof = homepage.querySelector<HTMLElement>(".lift-first-read");
      if (!cta || !proof) throw new Error("Homepage opening proof is incomplete");

      const ctaRect = cta.getBoundingClientRect();
      const proofRect = proof.getBoundingClientRect();
      return {
        ctaBottom: ctaRect.bottom,
        proofTop: proofRect.top,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        pageWidth: document.documentElement.scrollWidth,
      };
    });

    expect(openingLayout.pageWidth).toBeLessThanOrEqual(openingLayout.viewportWidth);
    expect(openingLayout.ctaBottom).toBeLessThanOrEqual(openingLayout.viewportHeight);
    expect(openingLayout.proofTop).toBeLessThan(openingLayout.viewportHeight);
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
