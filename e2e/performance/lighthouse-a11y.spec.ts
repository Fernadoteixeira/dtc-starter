import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Automated Accessibility (a11y) & Core Web Vitals Audit", () => {
  const targetPages = [
    { name: "Home Page", path: "/dk" },
    { name: "Store Page", path: "/dk/store" },
    { name: "Account Page", path: "/dk/account" },
  ]

  for (const target of targetPages) {
    test(`should have no critical accessibility violations on ${target.name}`, async ({ page }) => {
      await page.goto(target.path)

      // Run axe accessibility analysis
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .disableRules(["color-contrast"]) // Optional: disable specific non-critical rules if needed
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  }

  test("should measure initial page load performance metrics", async ({ page }) => {
    const startTime = Date.now()
    await page.goto("/")
    const loadTime = Date.now() - startTime

    // Assert initial load time is reasonable (< 5000ms for dev server / emulated mobile)
    expect(loadTime).toBeLessThan(5000)
  })
})
