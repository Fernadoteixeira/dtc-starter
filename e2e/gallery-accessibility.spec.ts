import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Gallery Experience Accessibility", () => {
  test("initial fold meets accessibility guidelines with zero critical violations", async ({
    page,
  }) => {
    await page.goto("/dk");
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-gallery-experience="true"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toEqual([]);
  });
});
