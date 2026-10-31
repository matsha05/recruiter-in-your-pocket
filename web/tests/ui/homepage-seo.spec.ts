import { expect, test } from "@playwright/test";

const homepageDescription = "Get a free resume report with feedback on what recruiters may notice, which details need explanation, and up to three changes to make before you apply.";

test.describe("homepage feedback and SEO contract", () => {
  test("the homepage explains the report and keeps the offer tool in the footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("See what a recruiter sees.");
    await expect(homepage).toContainText(
      "What you meant isn’t always what they read. See what comes through, what slips past, and what to fix first.",
    );

    await expect(homepage.getByTestId("landing-primary-cta")).toHaveText("Get your free report");
    await expect(homepage.getByTestId("landing-primary-cta")).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(page.getByRole("link", { name: "See a sample report", exact: true })).toHaveAttribute(
      "href",
      "/sample-report",
    );
    const hero = homepage.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByText("Your first report is free. No account or card needed, and anonymous reports don’t store your resume text.", { exact: true })).toBeVisible();
    // Free-report limits live on pricing and in the FAQ, not on the homepage.
    await expect(homepage).not.toContainText("Free report limits");
    await expect(homepage).not.toContainText("per calendar month");
    await expect(homepage).not.toContainText("Trusted by people at");
    const preview = homepage.getByRole("article", { name: "Sample resume report preview", exact: true });
    await expect(preview).toContainText("Verdict");
    await expect(preview).toContainText("First Impression score");
    await expect(preview).toContainText("Critical Miss");

    const founder = page.getByRole("heading", { level: 2, name: "Fourteen years of hiring, turned into the criteria." });
    await expect(founder).toBeVisible();
    await expect(page.getByAltText("Matt Shaw, founder of Recruiter in Your Pocket")).toBeVisible();
    await expect(homepage).toContainText("I’ve spent 14 years in recruiting and hiring.".replace("’", "'"));
    await expect(homepage).toContainText("I wrote the review criteria. AI applies them to your resume, so I don't read individual reports.");
    await expect(homepage).toContainText("The companies above are my work history; none of them sponsor or endorse this product.");
    await expect(page.getByRole("link", { name: "Meet Matt" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/mattrshaw",
    );
    await expect(page.getByRole("heading", { level: 2, name: "Good work deserves a good read." })).toBeVisible();

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
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });
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
