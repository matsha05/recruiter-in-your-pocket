import { expect, test } from "@playwright/test";
import { JORDAN_EXAMPLE } from "../../lib/marketing/jordan-example";

const shareDescription = "See what a recruiter sees, line by line. Your first report is free. No account or card.";
const homepageDescription = "A free resume report that shows what a recruiter takes from your resume, the lines they’d stop on, and what to add to each one before you apply.";

test.describe("homepage feedback and SEO contract", () => {
  test("the homepage explains the report and keeps the offer tool in the footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true", { timeout: 30_000 });

    const homepage = page.locator("[data-visual-anchor='landing-home']");
    await expect(homepage).toBeVisible();
    // The pile: the number is in the heading's name; the ticking digit flaps are hidden from assistive technology.
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("244 people applied for the job you wanted.");
    await expect(homepage).toContainText("Eighteen got called back. The other 226 have no idea why the recruiter passed.");
    await expect(homepage).toContainText("Greenhouse, The Hire Standard, March 2026");

    await expect(homepage.getByTestId("landing-primary-cta")).toHaveText("Get your free report");
    await expect(homepage.getByTestId("landing-primary-cta")).toHaveAttribute(
      "href",
      "/workspace",
    );
    await expect(page.getByRole("link", { name: "See Jordan’s report", exact: true })).toHaveAttribute(
      "href",
      "/sample-report",
    );
    const hero = homepage.locator("section[aria-labelledby='hero-title']");
    // The button already says the report is free; the hero carries no fine print under it.
    await expect(hero).not.toContainText("No account or card");
    // Free-report limits live on pricing and in the FAQ, not on the homepage.
    await expect(homepage).not.toContainText("Free report limits");
    await expect(homepage).not.toContainText("per calendar month");
    await expect(homepage).not.toContainText("Trusted by people at");
    // The read: the sentence, then the recruiter's two choices and the ending once the pen has run.
    const read = homepage.getByTestId("landing-read");
    await expect(read.getByRole("heading", { level: 2 })).toHaveText("By the time you finish reading this sentence, a recruiter has finished reading your resume.");
    await expect(read).toContainText("Move forward");
    await expect(read).toContainText("Reject");
    await expect(read).toContainText("Nobody tells you why.");
    await expect(read).toContainText("We do, before you apply for the next one.");
    // The note Jordan never saw: one clipping, one link. The report's own sentence and questions stay on the sample report.
    const example = homepage.locator("#how-it-works");
    await expect(example.getByRole("heading", { level: 2, name: "Here’s the note Jordan never saw." })).toBeVisible();
    await expect(example.getByText("Fictional example", { exact: true })).toBeVisible();
    // The clipping is requoted from the sample report (lib/marketing/jordan-example.ts), so it follows the sample.
    await expect(example).toContainText(JORDAN_EXAMPLE.line);
    await expect(example).toContainText(JORDAN_EXAMPLE.note);
    await expect(example).not.toContainText("What factors did you review");
    await expect(example).not.toContainText("Jordan’s answer");
    await expect(example).not.toContainText("Blank on purpose");
    await expect(example.getByRole("link", { name: "See Jordan’s full report" })).toHaveAttribute("href", "/sample-report");
    // The silence beat was cut on Nov 4, 2026: the pile tells it.
    await expect(homepage).not.toContainText("Not even a reply.");
    const progress = homepage.getByTestId("landing-progress-beat");
    await expect(progress.getByRole("heading", { level: 2, name: "Fix it. Then check it again." })).toBeVisible();
    await expect(progress).toContainText("Changed. Up 6.");
    await expect(progress).toContainText("Up 11 since the first report.");
    await expect(progress).not.toContainText("fixed");
    const truths = homepage.locator("#what-we-look-for");
    await expect(truths.getByRole("heading", { level: 2 })).toHaveText("What we fix, line by line.");
    await expect(truths).toContainText("We show you where. The lines a recruiter would stop on, in the order they’d read them.");
    await expect(truths).toContainText("Nobody can score you against an ATS or tell you your interview odds.");

    // The founder note (Nov 4, 2026): a drawing and a signed note, no name, no photograph, no profile link, no employer names.
    const founder = homepage.locator("#about");
    await expect(founder).toContainText("I’ve passed on more people than I can count. A few seconds a resume, fifteen years, at companies you’ve heard of and small ones around the world. The reasons were almost always the same, and nobody told you. I wrote them down.");
    await expect(founder.getByRole("img", { name: /drawing of the recruiter/ })).toBeVisible();
    await expect(founder.locator("img")).toHaveAttribute("src", /founder-mark/);
    await expect(founder.getByRole("link", { name: "How the report works" })).toHaveAttribute("href", "/methodology");
    await expect(founder).not.toContainText("Who built this");
    // The AI disclosure moved off the homepage on Nov 4, 2026; it lives on How the report works and in the legal content.
    await expect(founder).not.toContainText("AI applies");
    await expect(page.locator('a[href*="linkedin.com/in"]')).toHaveCount(0);
    for (const identifying of ["Matt", "Shaw", "Google", "Meta", "OpenAI"]) {
      await expect(homepage).not.toContainText(identifying);
    }
    await expect(homepage).not.toContainText("hired hundreds");
    await expect(homepage).not.toContainText("led hiring globally");
    await expect(homepage).not.toContainText("14 years");
    await expect(page.getByRole("heading", { level: 2, name: "Before you apply for the next one." })).toBeVisible();
    await expect(homepage).not.toContainText("Good work deserves a good read.");

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
    // The layout adds the site's Organization and WebSite; this is the homepage's own graph.
    const structuredData = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').allTextContents())
        .find((text) => text.includes("SoftwareApplication")) || "{}",
    );
    const graph = structuredData["@graph"] as Array<Record<string, unknown>>;
    const applicationData = graph.find((entry) => entry["@type"] === "SoftwareApplication");
    expect(graph.some((entry) => entry["@type"] === "Person")).toBe(false);
    expect(JSON.stringify(structuredData)).not.toMatch(/Matt|Shaw|linkedin\.com\/in/);
    expect(applicationData).toMatchObject({ description: homepageDescription });
    expect(JSON.stringify(structuredData)).not.toContain("the three most important changes");
    expect(applicationData?.offers).toEqual(expect.arrayContaining([
      expect.objectContaining({ price: "0" }),
      expect.objectContaining({
        price: "29",
        description: expect.stringContaining("over 90 days"),
      }),
    ]));
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/home\?v=20261104/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/og\/home\?v=20261104/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    const card = await page.request.get("/og/home?v=20261104");
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

    // Help shows every answer under its question (Nov 4, 2026): nothing to open.
    await page.goto("/help");
    await expect(page.getByRole("heading", { name: "Is the first report really free?", exact: true })).toBeVisible();
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
        /opengraph-image\?v=20261104/,
      );
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        /opengraph-image\?v=20261104/,
      );
    }
  });

  test("the sitemap publishes the calculator, omits the workspace, and dates pages by their content", async ({ request }) => {
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
    // lastmod comes from PUBLIC_PAGES, never the build date.
    const today = new Date().toISOString().slice(0, 10);
    const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
    expect(lastmods.length).toBe((xml.match(/<url>/g) ?? []).length);
    expect(lastmods.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && value <= today)).toBe(true);
  });
});
