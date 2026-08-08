# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront\checkout.spec.ts >> Storefront - Customer Checkout & Cart Journey >> should navigate to store page and browse products
- Location: e2e\storefront\checkout.spec.ts:18:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*store.*/
Received string:  "http://localhost:8000/dk"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="en" data-mode="light">…</html>
       - unexpected value "http://localhost:8000/dk"

```

```yaml
- main:
  - navigation:
    - button "Menu"
    - link "Medusa Store":
      - /url: /dk
    - button "Cart (0)":
      - link "Cart (0)":
        - /url: /dk/cart
  - region "Fio Vivo Interactive Gallery":
    - complementary:
      - paragraph: Coleção n.º 01
      - heading "Fio Vivo" [level=1]
      - paragraph: O crochê se move
      - text: 01 / 06
    - region "Espiral dourada":
      - img "Espiral dourada - frente"
      - button "Espiral dourada - perfil":
        - img "Espiral dourada - perfil"
      - button "Espiral dourada - gesto":
        - img "Espiral dourada - gesto"
      - button "Espiral dourada - detalhe":
        - img "Espiral dourada - detalhe"
      - heading "Espiral dourada" [level=2]
    - button "Órbita negra":
      - img "Órbita negra - frente"
    - button "Trama solar":
      - img "Trama solar - frente"
    - navigation "Gallery pagination":
      - button "Previous artwork": ←
      - tablist:
        - tab "Go to artwork 1" [selected]
        - tab "Go to artwork 2"
        - tab "Go to artwork 3"
        - tab "Go to artwork 4"
        - tab "Go to artwork 5"
        - tab "Go to artwork 6"
      - button "Next artwork": →
    - button "Conhecer a peça"
  - list
  - link "Medusa Store":
    - /url: /dk
  - text: Categories
  - list:
    - listitem:
      - link "Sweatshirts":
        - /url: /dk/categories/sweatshirts
      - list
    - listitem:
      - link "Shirts":
        - /url: /dk/categories/shirts
      - list
    - listitem:
      - link "Pants":
        - /url: /dk/categories/pants
      - list
    - listitem:
      - link "Merch":
        - /url: /dk/categories/merch
      - list
  - text: Medusa
  - list:
    - listitem:
      - link "GitHub":
        - /url: https://github.com/medusajs
    - listitem:
      - link "Documentation":
        - /url: https://docs.medusajs.com
    - listitem:
      - link "Source code":
        - /url: https://github.com/medusajs/dtc-starter
  - paragraph: © 2026 Medusa Store. All rights reserved.
  - paragraph:
    - text: Powered by
    - link:
      - /url: https://www.medusajs.com
      - img
    - text: "&"
    - link:
      - /url: https://nextjs.org
      - img
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Storefront - Customer Checkout & Cart Journey", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Navigate to homepage
  6  |     await page.goto("/")
  7  |   })
  8  | 
  9  |   test("should display home page elements and navigation bar", async ({ page }) => {
  10 |     // Check navigation bar presence
  11 |     const nav = page.locator("nav")
  12 |     await expect(nav).toBeVisible()
  13 | 
  14 |     // Check header text or logo
  15 |     await expect(page).toHaveTitle(/Medusa|Store/i)
  16 |   })
  17 | 
  18 |   test("should navigate to store page and browse products", async ({ page }) => {
  19 |     // Click on store link in navigation
  20 |     const storeLink = page.getByRole("link", { name: /store/i }).first()
  21 |     if (await storeLink.isVisible()) {
  22 |       await storeLink.click()
  23 |     } else {
  24 |       await page.goto("/us/store")
  25 |     }
  26 | 
  27 |     // Verify products grid is loaded
> 28 |     await expect(page).toHaveURL(/.*store.*/)
     |                        ^ Error: expect(page).toHaveURL(expected) failed
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