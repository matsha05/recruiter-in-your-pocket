import { expect, test, type Locator, type Page } from "@playwright/test";

// The sample is the worklist report (Nov 6, 2026): Overview, Line by line, Role fit.
const SECTIONS = [
  { id: "section-first-impression", label: "Overview" },
  { id: "section-fixes", label: "Lines" },
  { id: "section-role", label: "Role fit" },
] as const;

async function expectCurrent(page: Page, label: string) {
  const navigation = page.locator('nav[aria-label="Resume report sections"]');
  await expect(navigation.locator('[aria-current="location"]')).toHaveCount(1);
  // By section, so the check also reads the phone tabs while they wait off screen.
  const id = SECTIONS.find((section) => section.label === label)!.id;
  await expect(navigation.locator(`button[data-section="${id}"]`)).toHaveAttribute("aria-current", "location");
}

async function expectSectionBelowNavigation(page: Page, id: string) {
  await expect.poll(() => page.locator(`#${id}`).evaluate((section) => {
    const nav = document.querySelector('nav[aria-label="Resume report sections"]')!;
    const navBottom = nav.closest("aside")!.getBoundingClientRect().bottom;
    const top = section.getBoundingClientRect().top;
    // The report scrolls with the page, so the last section may stop short of the tabs at the end of the page.
    const page = document.scrollingElement!;
    const atEnd = page.scrollTop + page.clientHeight >= page.scrollHeight - 2;
    return top >= navBottom - 1 && (top <= navBottom + 120 || (atEnd && top < window.innerHeight));
  })).toBe(true);
}

/** On phones the tabs wait until the opening read has scrolled away (plan item 2.5). */
async function revealNavigation(page: Page) {
  const navigation = page.locator('nav[aria-label="Resume report sections"]');
  if (await navigation.isVisible()) return navigation;
  await page.locator("#section-fixes").evaluate((section) => {
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  });
  await expect(navigation).toBeVisible();
  return navigation;
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
    const navigation = page.locator('nav[aria-label="Resume report sections"]');
    await expectCurrent(page, "Overview");

    // Visit non-adjacent targets in both directions so intermediate scroll events
    // cannot leave the previous observer entry selected after a smooth jump.
    for (const index of [2, 0, 1]) {
      const section = SECTIONS[index];
      await revealNavigation(page);
      await navigation.getByRole("button", { name: section.label, exact: true }).click();
      await expectSectionBelowNavigation(page, section.id);
      await expectCurrent(page, section.label);
    }

    // Each card holds the line, the note, the example and the question, in that order, at every width.
    const firstCard = page.getByTestId("worklist-card").first();
    const parts = await Promise.all([firstCard.locator("blockquote, p").nth(1).boundingBox(), firstCard.getByTestId("worklist-example").boundingBox()]);
    expect(parts[1]!.y).toBeGreaterThan(parts[0]!.y);

    const fixesHeight = await page.locator("#section-fixes").evaluate((section) => section.getBoundingClientRect().height);
    expect(fixesHeight).toBeGreaterThan(viewport.height);
    await scrollInsideSection(page, "section-fixes", 0.7);
    await expectCurrent(page, "Lines");
    await scrollInsideSection(page, "section-role", 0.3);
    await expectCurrent(page, "Role fit");
    await scrollInsideSection(page, "section-fixes", 0.3);
    await expectCurrent(page, "Lines");
    await scrollInsideSection(page, "section-first-impression", 0.3);
    await expectCurrent(page, "Overview");
  });
}

for (const width of [320, 390]) {
  test(`the first card exposes its line and its question after the navigation jump at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/sample-report");
    await page.evaluate(() => document.fonts.ready);
    const navigation = await revealNavigation(page);
    await navigation.getByRole("button", { name: "Lines", exact: true }).click();
    await expectSectionBelowNavigation(page, "section-fixes");
    await expectCurrent(page, "Lines");

    // Inspect the heading and the first card's line themselves. No further scrolling occurs after the jump.
    await expectInsideReadingViewport(page.locator("#fixes-title"));
    await expectInsideReadingViewport(page.locator("#section-card-1 blockquote, #section-card-1 > p").first());
  });
}

test("workspace report navigation supports keyboard jumps with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/workspace?sample=1");
  const navigation = page.locator('nav[aria-label="Resume report sections"]');

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
  await expectCurrent(page, "Lines");
});
