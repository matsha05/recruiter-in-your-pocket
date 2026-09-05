import { expect, test } from "@playwright/test";

const configuredStatus = {
  ok: true,
  generatedAt: "2026-09-04T18:00:00.000Z",
  summary: {
    status: "configured",
    title: "Required settings are in place",
    message: "The configuration checks passed. These checks do not measure live uptime.",
  },
  services: [{
    name: "Resume reports",
    status: "configured",
    message: "Required report settings and quality checks are in place.",
  }],
  incidents: [],
};

test("status does not claim success before the configuration check finishes", async ({ page }) => {
  let releaseResponse = () => {};
  const responseGate = new Promise<void>((resolve) => { releaseResponse = resolve; });
  await page.route("**/api/status", async (route) => {
    await responseGate;
    await route.fulfill({ json: configuredStatus });
  });

  try {
    const requestStarted = page.waitForRequest("**/api/status");
    await page.goto("/status", { waitUntil: "domcontentloaded" });
    await requestStarted;
    await expect(page.getByRole("heading", { name: "Checking configuration...", exact: true })).toBeVisible();
    await expect(page.getByText("Waiting for the checks to finish.", { exact: true })).toBeVisible();
    await expect(page.getByText(/The required configuration checks passed/)).toHaveCount(0);
    await expect(page.getByText(/No configuration blockers/)).toHaveCount(0);
  } finally {
    releaseResponse();
  }

  await expect(page.getByRole("heading", { name: "Required settings are in place", exact: true })).toBeVisible();
  await expect(page.getByText(/The required configuration checks passed/)).toBeVisible();
});

test("a failed status request has a recovery action and never reports a passed check", async ({ page }) => {
  let failRequest = true;
  await page.route("**/api/status", (route) => failRequest
    ? route.fulfill({ status: 500, json: { error: "Unavailable" } })
    : route.fulfill({ json: configuredStatus }));

  await page.goto("/status", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "We could not check the configuration", exact: true })).toBeVisible();
  await expect(page.getByText("We cannot tell which settings need attention until the check succeeds.", { exact: true })).toBeVisible();
  await expect(page.getByText(/The required configuration checks passed/)).toHaveCount(0);
  await expect(page.getByText(/No configuration blockers/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Get help", exact: true })).toHaveAttribute("href", "/support");

  failRequest = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Required settings are in place", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toHaveCount(0);
});

test("a completed limited check identifies the affected feature without claiming success", async ({ page }) => {
  await page.route("**/api/status", (route) => route.fulfill({
    json: {
      ...configuredStatus,
      ok: false,
      summary: {
        status: "limited",
        title: "Some settings need attention",
        message: "One or more configuration checks failed. These checks do not measure live uptime.",
      },
      services: [{
        name: "Payments and purchase restoration",
        status: "limited",
        message: "Some required payment or purchase restoration settings need attention.",
      }],
      incidents: ["Billing configuration checks need attention. Checkout, purchase restoration, or receipts may be affected."],
    },
  }));

  await page.goto("/status", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Some settings need attention", exact: true })).toBeVisible();
  await expect(page.getByText("Needs attention", { exact: true })).toBeVisible();
  await expect(page.getByText("Some required payment or purchase restoration settings need attention.", { exact: true })).toBeVisible();
  await expect(page.getByText(/The required configuration checks passed/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toHaveCount(0);
});
