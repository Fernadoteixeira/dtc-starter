# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: storefront\checkout.spec.ts >> Storefront - Customer Checkout & Cart Journey >> should display home page elements and navigation bar
- Location: e2e\storefront\checkout.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav')
Expected: visible
Error: strict mode violation: locator('nav') resolved to 2 elements:
    1) <nav class="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">…</nav> aka getByText('MenuMedusa StoreAccountCart (')
    2) <nav class="dtc-gallery__navigation" aria-label="Gallery pagination">…</nav> aka getByRole('navigation', { name: 'Gallery pagination' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - navigation [ref=e5]:
      - button "Menu" [ref=e12] [cursor=pointer]
      - link "Medusa Store" [ref=e14]:
        - /url: /dk
      - button [ref=e18] [cursor=pointer]:
        - link "Cart (0)" [ref=e19]:
          - /url: /dk/cart
    - region "Fio Vivo Interactive Gallery" [ref=e21]:
      - complementary [ref=e22]:
        - paragraph [ref=e23]: Coleção n.º 01
        - heading "Fio Vivo" [level=1] [ref=e24]
        - paragraph [ref=e25]: O crochê se move
        - text: 01 / 06
      - generic [ref=e27]:
        - region "Espiral dourada" [ref=e28]:
          - img "Espiral dourada - frente" [ref=e30]
          - generic "Alternative views" [ref=e31]:
            - button [ref=e32] [cursor=pointer]:
              - img "Espiral dourada - perfil" [ref=e33]
            - button [ref=e34] [cursor=pointer]:
              - img "Espiral dourada - gesto" [ref=e35]
            - button [ref=e36] [cursor=pointer]:
              - img "Espiral dourada - detalhe" [ref=e37]
          - generic [ref=e38]:
            - generic [ref=e39]: "01"
            - heading "Espiral dourada" [level=2] [ref=e40]
        - button "Órbita negra" [ref=e41] [cursor=pointer]:
          - img "Órbita negra - frente" [ref=e43]
        - button "Trama solar" [ref=e44] [cursor=pointer]:
          - img "Trama solar - frente" [ref=e46]
      - navigation "Gallery pagination" [ref=e47]:
        - generic [ref=e48]:
          - button "Previous artwork" [ref=e49] [cursor=pointer]: ←
          - tablist:
            - tab "Go to artwork 1" [selected]
            - tab "Go to artwork 2"
            - tab "Go to artwork 3"
            - tab "Go to artwork 4"
            - tab "Go to artwork 5"
            - tab "Go to artwork 6"
          - button "Next artwork" [ref=e50] [cursor=pointer]: →
      - button "Conhecer a peça" [ref=e52] [cursor=pointer]
    - generic [ref=e53]:
      - list
    - generic [ref=e55]:
      - generic [ref=e56]:
        - link "Medusa Store" [ref=e58]:
          - /url: /dk
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: Categories
            - list [ref=e62]:
              - listitem [ref=e63]:
                - link "Sweatshirts" [ref=e64]:
                  - /url: /dk/categories/sweatshirts
                - list
              - listitem [ref=e65]:
                - link "Shirts" [ref=e66]:
                  - /url: /dk/categories/shirts
                - list
              - listitem [ref=e67]:
                - link "Pants" [ref=e68]:
                  - /url: /dk/categories/pants
                - list
              - listitem [ref=e69]:
                - link "Merch" [ref=e70]:
                  - /url: /dk/categories/merch
                - list
          - generic [ref=e71]:
            - generic [ref=e72]: Medusa
            - list [ref=e73]:
              - listitem [ref=e74]:
                - link "GitHub" [ref=e75]:
                  - /url: https://github.com/medusajs
              - listitem [ref=e76]:
                - link "Documentation" [ref=e77]:
                  - /url: https://docs.medusajs.com
              - listitem [ref=e78]:
                - link "Source code" [ref=e79]:
                  - /url: https://github.com/medusajs/dtc-starter
      - generic [ref=e80]:
        - paragraph [ref=e81]: © 2026 Medusa Store. All rights reserved.
        - paragraph [ref=e82]:
          - text: Powered by
          - link [ref=e83]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link [ref=e86]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e94] [cursor=pointer]
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
> 12 |     await expect(nav).toBeVisible()
     |                       ^ Error: expect(locator).toBeVisible() failed
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