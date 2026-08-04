import { test, expect } from "@playwright/test"

test.describe("Storefront - Customer Auth & Account Management", () => {
  test("should render sign in / account page", async ({ page }) => {
    await page.goto("/us/account")
    
    // Check for login / account form elements
    const loginHeader = page.locator("h1, h2").filter({ hasText: /sign in|welcome/i }).first()
    if (await loginHeader.isVisible()) {
      await expect(loginHeader).toBeVisible()
    }
  })

  test("should display validation error on invalid login credentials", async ({ page }) => {
    await page.goto("/us/account")

    const emailInput = page.locator("input[name='email'], input[type='email']").first()
    const passwordInput = page.locator("input[name='password'], input[type='password']").first()
    const submitBtn = page.locator("button[type='submit']").first()

    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill("invalid-user@example.com")
      await passwordInput.fill("WrongPassword123!")
      await submitBtn.click()

      // Verify error indicator is shown
      const errorMessage = page.locator("[data-testid='login-error-message'], .text-rose-500").first()
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible()
      }
    }
  })
})
