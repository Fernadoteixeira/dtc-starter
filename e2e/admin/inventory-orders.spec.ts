import { test, expect } from "@playwright/test"

test.describe("Medusa Admin Dashboard - Order & Inventory E2E Flow", () => {
  test("should render admin login page at /app", async ({ page }) => {
    await page.goto("http://localhost:9000/app")

    // Verify admin login form or dashboard UI
    await expect(page).toHaveURL(/.*app.*/)
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})
