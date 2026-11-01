import { expect, test } from "@playwright/test";

const shareDescription = "Find the one thing to fix first. Your first report is free. No account or card.";
const homepageDescription = "Get a free resume report with feedback on what recruiters may notice, which details need explanation, and up to three changes to make before you apply.";

test.describe("homepage feedback and SEO contract", () => {
  test("the homepage explains the report and keeps the offer tool in the footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("They called someone back. It wasn’t you.");
    await expect(homepage).toContainText(
      "See what a recruiter sees on your resume, and the one thing to fix first.",
    );

    await expect(homepage.getByTestId("landing-primary-cta")).toHaveText("Read mine");
    await expect(homepage.getByTestId("landing-primary-cta")).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(page.getByRole("link", { name: "See an example", exact: true })).toHaveAttribute(
      "href",
      "/sample-report",
    );
    const hero = homepage.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByText("Your first report is free. No account or card.", { exact: true })).toBeVisible();
    // Free-report limits live on pricing and in the FAQ, not on the homepage.
    await expect(homepage).not.toContainText("Free report limits");
    await expect(homepage).not.toContainText("per calendar month");
    await expect(homepage).not.toContainText("Trusted by people at");
    // The blurred note is decoration; the story says the same thing in text.
    await expect(homepage.getByRole("heading", { level: 2, name: "Not even a reply." })).toBeVisible();
    await expect(homepage).toContainText("Sometimes it’s one line on your resume. That part you can fix.");
    await expect(homepage.locator("blockquote")).toContainText("What’s missing is proof Jordan changed the outcome.");
    await expect(homepage.getByRole("heading", { level: 2, name: "What would they think of yours?" })).toBeVisible();
    const truths = homepage.locator("#how-it-works");
    await expect(truths.getByRole("heading", { level: 2 })).toHaveText("What we look for, line by line.");
    await expect(truths).toContainText("One Critical Miss, not forty tips.");
    await expect(truths).toContainText("No ATS score. No interview odds.");

    const founder = page.getByRole("heading", { level: 2, name: "I've hired hundreds of people and led hiring globally at OpenAI, Meta, and Google." });
    await expect(founder).toBeVisible();
    await expect(page.getByAltText("Matt Shaw, founder of Recruiter in Your Pocket")).toBeVisible();
    await expect(homepage).toContainText("After 14 years in recruiting, I built this");
    await expect(homepage).toContainText("Heads up: I wrote the review criteria, and AI applies them to your resume. I don't read each report myself.");
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
    // A shared link leads with the hero's story; search keeps the plain description.
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", shareDescription);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", shareDescription);
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
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/home\?v=20261101/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/og\/home\?v=20261101/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    const card = await page.request.get("/og/home?v=20261101");
    expect(card.status()).toBe(200);
    expect(card.headers()["content-type"]).toBe("image/png");
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
        /opengraph-image\?v=20261031/,
      );
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        /opengraph-image\?v=20261031/,
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
