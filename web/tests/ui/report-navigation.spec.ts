import { expect, test, type Page } from "@playwright/test";

const SECTIONS = [
  { id: "section-first-impression", label: "The read" },
  { id: "section-fixes", label: "Fix these first" },
  { id: "section-keep", label: "Keep these" },
  { id: "section-role", label: "Role direction" },
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
    await expectCurrent(page, "The read");

    // Visit non-adjacent targets in both directions so intermediate scroll events
    // cannot leave the previous observer entry selected after a smooth jump.
    for (const index of [3, 0, 2, 1]) {
      const section = SECTIONS[index];
      await navigation.getByRole("button", { name: section.label, exact: true }).click();
      await expectSectionBelowNavigation(page, section.id);
      await expectCurrent(page, section.label);
    }

    const fixesHeight = await page.locator("#section-fixes").evaluate((section) => section.getBoundingClientRect().height);
    expect(fixesHeight).toBeGreaterThan(viewport.height * 2);
    await scrollInsideSection(page, "section-fixes", 0.7);
    await expectCurrent(page, "Fix these first");
    await scrollInsideSection(page, "section-keep", 0.3);
    await expectCurrent(page, "Keep these");
    await scrollInsideSection(page, "section-role", 0.3);
    await expectCurrent(page, "Role direction");
    await scrollInsideSection(page, "section-fixes", 0.3);
    await expectCurrent(page, "Fix these first");
    await scrollInsideSection(page, "section-first-impression", 0.3);
    await expectCurrent(page, "The read");
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
