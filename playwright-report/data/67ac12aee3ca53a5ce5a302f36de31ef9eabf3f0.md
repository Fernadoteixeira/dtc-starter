# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront\checkout.spec.ts >> Storefront - Customer Checkout & Cart Journey >> should add product to cart and proceed to checkout overview
- Location: e2e\storefront\checkout.spec.ts:31:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:8000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Storefront - Customer Checkout & Cart Journey", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to homepage
> 6  |     await page.goto("/")
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  7  |   })
  8  | 
  9  |   test("should display home page elements and navigation bar", async ({ page }) => {
  10 |     // Check navigation bar presence in header
  11 |     const nav = page.locator("header nav").first()
  12 |     await expect(nav).toBeVisible()
  13 | 
  14 |     // Check header text or logo
  15 |     await expect(page).toHaveTitle(/Medusa|Store/i)
  16 |   })
  17 | 
  18 |   test("should navigate to store page and browse products", async ({ page }) => {
  19 |     // Click on store link in navigation bar
  20 |     const storeLink = page.locator("a[href*='/store']").first()
  21 |     if (await storeLink.isVisible()) {
  22 |       await storeLink.click()
  23 |     } else {
  24 |       await page.goto("/dk/store")
  25 |     }
  26 | 
  27 |     // Verify products grid is loaded
  28 |     await expect(page).toHaveURL(/.*store.*/)
  29 |   })
  30 | 
  31 |   test("should add product to cart and proceed to checkout overview", async ({ page }) => {
  32 |     await page.goto("/us/store")
  33 | 
  34 |     // Select first product if present
  35 |     const firstProduct = page.locator("[data-testid='product-wrapper']").first()
  36 |     if (await firstProduct.isVisible()) {
  37 |       await firstProduct.click()
  38 | 
  39 |       // Select size/option if required
  40 |       const optionBtn = page.locator("[data-testid='option-button']").first()
  41 |       if (await optionBtn.isVisible()) {
  42 |         await optionBtn.click()
  43 |       }
  44 | 
  45 |       // Add to cart
  46 |       const addToCartBtn = page.locator("[data-testid='add-product-button']")
  47 |       if (await addToCartBtn.isVisible()) {
  48 |         await addToCartBtn.click()
  49 |         // Verify cart dropdown / badge updates
  50 |         const cartDropdown = page.locator("[data-testid='cart-dropdown']")
  51 |         await expect(cartDropdown).toBeVisible()
  52 |       }
  53 |     }
  54 |   })
  55 | })
  56 | 
```