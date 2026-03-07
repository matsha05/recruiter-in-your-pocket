import fs from "fs";
import path from "path";

import { test, type Page } from "@playwright/test";
import { visualRoutes, type VisualRoute } from "./visual-routes";

const screenshotsDir = path.join(process.cwd(), "test-results", "screenshots");
const sampleReportPath = path.join(process.cwd(), "public", "sample-report.json");
const sampleReport = JSON.parse(fs.readFileSync(sampleReportPath, "utf8"));

const sampleJobs = [
  {
    id: "job_1",
    externalId: "job_1",
    title: "Senior Technical Program Manager",
    company: "Linear",
    location: "Remote (US)",
    url: "https://example.com/jobs/linear-tpm",
    score: 84,
    capturedAt: Date.now() - 1000 * 60 * 90,
    source: "linkedin",
    status: "interested",
  },
  {
    id: "job_2",
    externalId: "job_2",
    title: "Staff Program Manager, Product Operations",
    company: "OpenAI",
    location: "San Francisco, CA",
    url: "https://example.com/jobs/openai-ops",
    score: 77,
    capturedAt: Date.now() - 1000 * 60 * 60 * 18,
    source: "indeed",
    status: "saved",
  },
];

const sampleJobDetail = {
  success: true,
  data: {
    id: "sample-job-id",
    externalId: "sample-job-id",
    title: "Senior Technical Program Manager",
    company: "Linear",
    location: "Remote (US)",
    url: "https://example.com/jobs/linear-tpm",
    score: 84,
    capturedAt: Date.now() - 1000 * 60 * 60 * 18,
    source: "linkedin",
    status: "interested",
    matchedSkills: ["Roadmap planning", "Stakeholder management", "Cross-functional leadership", "Launch execution"],
    missingSkills: ["SQL", "Experimentation", "Product analytics"],
    topGaps: [
      "Surface deeper analytics ownership in your resume bullets.",
      "Add a clearer example of launch scope across multiple teams.",
      "Name the tools you used to keep execution visible and measurable.",
    ],
    jobDescription: "Lead cross-functional launches, partner with engineering and product, and build clear operating rhythms for strategic work.",
    jdText: "Lead cross-functional launches, partner with engineering and product, and build clear operating rhythms for strategic work.",
  },
};

async function installMocks(page: Page, route: VisualRoute) {
  if (route.mockKey === "jobs-list") {
    await page.route("**/api/extension/saved-jobs", async (requestRoute) => {
      await requestRoute.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, jobs: sampleJobs }),
      });
    });
  }

  if (route.mockKey === "job-detail") {
    await page.route("**/api/extension/saved-jobs/sample-job-id", async (requestRoute) => {
      await requestRoute.fulfill({
        contentType: "application/json",
        body: JSON.stringify(sampleJobDetail),
      });
    });
  }

  if (route.mockKey === "report-detail") {
    await page.route("**/api/reports/sample-report-id-0001", async (requestRoute) => {
      await requestRoute.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          report: sampleReport,
          jdPreview: "Senior Technical Program Manager role focused on cross-functional launches and operating rigor.",
        }),
      });
    });
  }
}

test.describe("ui screenshots", () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  });

  for (const route of visualRoutes) {
    test(route.name, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      if (route.viewport) {
        await page.setViewportSize(route.viewport);
      }

      await installMocks(page, route);

      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(route.waitFor, { timeout: 30_000 });
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: path.join(screenshotsDir, `${route.name}.png`),
        fullPage: route.fullPage ?? true,
      });
    });
  }
});
