import { expect, test, type Locator, type Page } from "@playwright/test";

const SECTIONS = [
  { id: "section-first-impression", label: "Overview" },
  { id: "section-fixes", label: "Fix these first" },
  { id: "section-keep", label: "Keep these" },
  { id: "section-role", label: "Role fit" },
] as const;

async function expectCurrent(page: Page, label: string) {
  const navigation = page.getByRole("navigation", { name: "Resume report sections" });
  await expect(navigation.locator('[aria-current="location"]')).toHaveCount(1);
  await expect(navigation.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-current", "location");
}

async function expectSectionBelowNavigation(page: Page, id: string) {
  await expect.poll(() => page.locator(`#${id}`).evaluate((section) => {
    const nav = document.querySelector('nav[aria-label="Resume report sections"]')!;
    const navBottom = nav.closest("aside")!.getBoundingClientRect().bottom;
    const top = section.getBoundingClientRect().top;
    return top >= navBottom - 1 && top <= navBottom + 120;
  })).toBe(true);
}

async function expectInsideReadingViewport(element: Locator) {
  await expect(element).toBeVisible();
  await expect.poll(() => element.evaluate((node) => {
    const nav = document.querySelector('nav[aria-label="Resume report sections"]')!;
    const navBottom = nav.closest("aside")!.getBoundingClientRect().bottom;
    const rect = node.getBoundingClientRect();
    return {
      belowNavigation: rect.top >= navBottom - 1,
      aboveViewportBottom: rect.bottom <= window.innerHeight + 1,
      insideLeftEdge: rect.left >= -1,
      insideRightEdge: rect.right <= window.innerWidth + 1,
    };
  }), "The complete text must fit in the visible reading area after the navigation jump").toEqual({
    belowNavigation: true,
    aboveViewportBottom: true,
    insideLeftEdge: true,
    insideRightEdge: true,
  });
}

async function scrollInsideSection(page: Page, id: string, fraction: number) {
  await page.locator(`#${id}`).evaluate((section, position) => {
    let container = section.parentElement!;
    while (container.parentElement && !(/auto|scroll/.test(getComputedStyle(container).overflowY) && container.scrollHeight > container.clientHeight)) {
      container = container.parentElement;
    }
    const navigation = document.querySelector('nav[aria-label="Resume report sections"]')!;
    const readingTop = navigation.closest("aside")!.getBoundingClientRect().bottom + 24;
    const sectionRect = section.getBoundingClientRect();
    container.scrollTo({
      top: container.scrollTop + sectionRect.top + sectionRect.height * position - readingTop,
      behavior: "instant",
    });
  }, fraction);
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
]) {
  test(`sample report navigation follows all jumps and manual scrolling at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/sample-report");
    await page.evaluate(() => document.fonts.ready);
    const navigation = page.getByRole("navigation", { name: "Resume report sections" });
    await expectCurrent(page, "Overview");

    // Visit non-adjacent targets in both directions so intermediate scroll events
    // cannot leave the previous observer entry selected after a smooth jump.
    for (const index of [3, 0, 2, 1]) {
      const section = SECTIONS[index];
      await navigation.getByRole("button", { name: section.label, exact: true }).click();
      await expectSectionBelowNavigation(page, section.id);
      await expectCurrent(page, section.label);
    }

    if (viewport.width >= 1024) {
      const firstFix = page.locator("#section-fix-1");
      await expect(firstFix.getByRole("list", { name: "How fix 1 moves from resume evidence to clearer wording", exact: true })).toHaveCount(0);
      await expect(page.locator("#section-fix-2").getByRole("list", { name: "How fix 2 moves from resume evidence to clearer wording", exact: true })).toBeVisible();
      expect(await firstFix.getByRole("heading", { level: 3 }).evaluate((heading) => Number.parseFloat(getComputedStyle(heading).fontSize))).toBeGreaterThan(24);
    }

    const fixesHeight = await page.locator("#section-fixes").evaluate((section) => section.getBoundingClientRect().height);
    expect(fixesHeight).toBeGreaterThan(viewport.height);
    await scrollInsideSection(page, "section-fixes", 0.7);
    await expectCurrent(page, "Fix these first");
    await scrollInsideSection(page, "section-keep", 0.3);
    await expectCurrent(page, "Keep these");
    await scrollInsideSection(page, "section-role", 0.3);
    await expectCurrent(page, "Role fit");
    await scrollInsideSection(page, "section-fixes", 0.3);
    await expectCurrent(page, "Fix these first");
    await scrollInsideSection(page, "section-first-impression", 0.3);
    await expectCurrent(page, "Overview");
  });
}

for (const width of [320, 390]) {
  test(`the first fix exposes its source and missing detail after the navigation jump at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/sample-report");
    await page.evaluate(() => document.fonts.ready);
    const navigation = page.getByRole("navigation", { name: "Resume report sections" });
    await navigation.getByRole("button", { name: "Fix these first", exact: true }).click();
    await expectSectionBelowNavigation(page, "section-fixes");
    await expectCurrent(page, "Fix these first");

    const firstFix = page.locator("#section-fix-1");
    const title = firstFix.getByRole("heading", { level: 3 });
    const titleSize = await title.evaluate((heading) => Number.parseFloat(getComputedStyle(heading).fontSize));
    expect(titleSize, "The action title stays readable without consuming the small-screen reading area").toBeGreaterThanOrEqual(18);
    expect(titleSize).toBeLessThanOrEqual(22);
    await expect(firstFix.locator('ol[aria-label="How fix 1 moves from resume evidence to clearer wording"]')).toBeHidden();

    // Inspect the source text and question label themselves. Checking document
    // scrollWidth or merely finding these nodes would miss a fix header that
    // pushes both below the fold. No further scrolling occurs after the jump.
    const sourceQuote = firstFix.locator("p").filter({ hasText: /^“/ });
    await expect(sourceQuote).toHaveCount(1);
    await expectInsideReadingViewport(sourceQuote);
    await expectInsideReadingViewport(firstFix.getByText("What is missing", { exact: true }));
  });
}

test("workspace report navigation supports keyboard jumps with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/workspace?sample=1");
  const navigation = page.getByRole("navigation", { name: "Resume report sections" });

  for (const section of [...SECTIONS].reverse()) {
    const button = navigation.getByRole("button", { name: section.label, exact: true });
    await button.focus();
    await button.press("Enter");
    await expectSectionBelowNavigation(page, section.id);
    await expectCurrent(page, section.label);
    await expect(button).toBeFocused();
  }

  // A keyboard jump does not pin the selection when the reader starts scrolling.
  await scrollInsideSection(page, "section-fixes", 0.5);
  await expectCurrent(page, "Fix these first");
});
