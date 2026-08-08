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
      - link "Medusa Store" [ref=e14] [cursor=pointer]:
        - /url: /dk
      - generic [ref=e15]:
        - link "Account" [ref=e17] [cursor=pointer]:
          - /url: /dk/account
        - button [ref=e20] [cursor=pointer]:
          - link "Cart (0)" [ref=e21]:
            - /url: /dk/cart
    - region "Fio Vivo Interactive Gallery" [ref=e23]:
      - complementary [ref=e24]:
        - paragraph [ref=e25]: Coleção n.º 01
        - heading "Fio Vivo" [level=1] [ref=e26]
        - paragraph [ref=e27]: O crochê se move
        - text: 01 / 06
      - generic [ref=e29]:
        - region "Espiral dourada" [ref=e30]:
          - img "Espiral dourada - frente" [ref=e32]
          - generic "Alternative views" [ref=e33]:
            - button [ref=e34] [cursor=pointer]:
              - img "Espiral dourada - perfil" [ref=e35]
            - button [ref=e36] [cursor=pointer]:
              - img "Espiral dourada - gesto" [ref=e37]
            - button [ref=e38] [cursor=pointer]:
              - img "Espiral dourada - detalhe" [ref=e39]
          - generic [ref=e40]:
            - generic [ref=e41]: "01"
            - heading "Espiral dourada" [level=2] [ref=e42]
        - button "Órbita negra" [ref=e43] [cursor=pointer]:
          - img "Órbita negra - frente" [ref=e45]
        - button "Trama solar" [ref=e46] [cursor=pointer]:
          - img "Trama solar - frente" [ref=e48]
      - navigation "Gallery pagination" [ref=e49]:
        - generic [ref=e50]:
          - button "Previous artwork" [ref=e51] [cursor=pointer]: ←
          - tablist:
            - tab "Go to artwork 1" [selected]
            - tab "Go to artwork 2"
            - tab "Go to artwork 3"
            - tab "Go to artwork 4"
            - tab "Go to artwork 5"
            - tab "Go to artwork 6"
          - button "Next artwork" [ref=e52] [cursor=pointer]: →
      - button "Conhecer a peça" [ref=e54] [cursor=pointer]
    - generic [ref=e55]:
      - list
    - generic [ref=e57]:
      - generic [ref=e58]:
        - link "Medusa Store" [ref=e60] [cursor=pointer]:
          - /url: /dk
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]: Categories
            - list [ref=e64]:
              - listitem [ref=e65]:
                - link "Sweatshirts" [ref=e66] [cursor=pointer]:
                  - /url: /dk/categories/sweatshirts
                - list
              - listitem [ref=e67]:
                - link "Shirts" [ref=e68] [cursor=pointer]:
                  - /url: /dk/categories/shirts
                - list
              - listitem [ref=e69]:
                - link "Pants" [ref=e70] [cursor=pointer]:
                  - /url: /dk/categories/pants
                - list
              - listitem [ref=e71]:
                - link "Merch" [ref=e72] [cursor=pointer]:
                  - /url: /dk/categories/merch
                - list
          - generic [ref=e73]:
            - generic [ref=e74]: Medusa
            - list [ref=e75]:
              - listitem [ref=e76]:
                - link "GitHub" [ref=e77] [cursor=pointer]:
                  - /url: https://github.com/medusajs
              - listitem [ref=e78]:
                - link "Documentation" [ref=e79] [cursor=pointer]:
                  - /url: https://docs.medusajs.com
              - listitem [ref=e80]:
                - link "Source code" [ref=e81] [cursor=pointer]:
                  - /url: https://github.com/medusajs/dtc-starter
      - generic [ref=e82]:
        - paragraph [ref=e83]: © 2026 Medusa Store. All rights reserved.
        - paragraph [ref=e84]:
          - text: Powered by
          - link [ref=e85] [cursor=pointer]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link [ref=e88] [cursor=pointer]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e96] [cursor=pointer]
  - alert [ref=e100]
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