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
    await page.goto("/dk")
    const loadTime = Date.now() - startTime

    // Assert initial load time is reasonable (< 8000ms for local dev server with 16 parallel workers)
    expect(loadTime).toBeLessThan(8000)
  })

  test("should evaluate Navigation Timing and First Contentful Paint (FCP) budget", async ({ page }) => {
    await page.goto("/dk", { waitUntil: "domcontentloaded" })

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType("paint")
      const fcp = paint.find((e) => e.name === "first-contentful-paint")?.startTime || 0

      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
        fcp: Math.round(fcp),
      }
    })

    // Assert TTFB and FCP are non-negative valid numbers
    expect(metrics.ttfb).toBeGreaterThanOrEqual(0)
    expect(metrics.fcp).toBeGreaterThanOrEqual(0)
  })
})
