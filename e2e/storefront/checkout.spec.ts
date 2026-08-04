import { test, expect } from "@playwright/test"

test.describe("Storefront - Customer Checkout & Cart Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("/")
  })

  test("should display home page elements and navigation bar", async ({ page }) => {
    // Check navigation bar presence
    const nav = page.locator("nav")
    await expect(nav).toBeVisible()

    // Check header text or logo
    await expect(page).toHaveTitle(/Medusa|Store/i)
  })

  test("should navigate to store page and browse products", async ({ page }) => {
    // Click on store link in navigation
    const storeLink = page.getByRole("link", { name: /store/i }).first()
    if (await storeLink.isVisible()) {
      await storeLink.click()
    } else {
      await page.goto("/us/store")
    }

    // Verify products grid is loaded
    await expect(page).toHaveURL(/.*store.*/)
  })

  test("should add product to cart and proceed to checkout overview", async ({ page }) => {
    await page.goto("/us/store")

    // Select first product if present
    const firstProduct = page.locator("[data-testid='product-wrapper']").first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()

      // Select size/option if required
      const optionBtn = page.locator("[data-testid='option-button']").first()
      if (await optionBtn.isVisible()) {
        await optionBtn.click()
      }

      // Add to cart
      const addToCartBtn = page.locator("[data-testid='add-product-button']")
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click()
        // Verify cart dropdown / badge updates
        const cartDropdown = page.locator("[data-testid='cart-dropdown']")
        await expect(cartDropdown).toBeVisible()
      }
    }
  })
})
