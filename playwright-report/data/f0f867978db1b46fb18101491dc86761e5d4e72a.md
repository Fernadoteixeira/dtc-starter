# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gallery-hero-fallback.spec.ts >> Gallery Hero Fallback Mode >> renders standard commercial Hero when feature flag is off
- Location: e2e\gallery-hero-fallback.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('header')
Expected: visible
Error: strict mode violation: locator('header') resolved to 2 elements:
    1) <header class="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">…</header> aka locator('header').filter({ hasText: 'MenuMedusa StoreAccountCart (' })
    2) <header class="relative z-10 px-8 pt-6 flex justify-between items-end">…</header> aka getByText('Collection 01Curated Gallery ExperienceImmerse in handcrafted design and')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('header')

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
    - region "Curated Gallery Experience" [ref=e23]:
      - generic [ref=e25]:
        - generic [ref=e26]: Collection 01
        - heading "Curated Gallery Experience" [level=2] [ref=e27]
      - generic [ref=e29]:
        - button "View Medusa T-Shirt" [ref=e30] [cursor=pointer]:
          - img "Medusa T-Shirt" [ref=e32]
          - generic [ref=e33]:
            - generic [ref=e34]: Shirts • 2026
            - heading "Medusa T-Shirt" [level=3] [ref=e35]
            - paragraph [ref=e36]: Medusa Studio
            - generic [ref=e37]:
              - generic [ref=e38]: € 10,00
              - generic [ref=e39]: out-of-stock
        - button "View Medusa Sweatshirt" [ref=e40] [cursor=pointer]:
          - img "Medusa Sweatshirt" [ref=e42]
          - generic [ref=e43]:
            - generic [ref=e44]: Sweatshirts • 2026
            - heading "Medusa Sweatshirt" [level=3] [ref=e45]
            - paragraph [ref=e46]: Medusa Studio
            - generic [ref=e47]:
              - generic [ref=e48]: € 10,00
              - generic [ref=e49]: out-of-stock
        - button "View Medusa Sweatpants" [ref=e50] [cursor=pointer]:
          - img "Medusa Sweatpants" [ref=e52]
          - generic [ref=e53]:
            - generic [ref=e54]: Pants • 2026
            - heading "Medusa Sweatpants" [level=3] [ref=e55]
            - paragraph [ref=e56]: Medusa Studio
            - generic [ref=e57]:
              - generic [ref=e58]: € 10,00
              - generic [ref=e59]: out-of-stock
        - button "View Medusa Shorts" [ref=e60] [cursor=pointer]:
          - img "Medusa Shorts" [ref=e62]
          - generic [ref=e63]:
            - generic [ref=e64]: Merch • 2026
            - heading "Medusa Shorts" [level=3] [ref=e65]
            - paragraph [ref=e66]: Medusa Studio
            - generic [ref=e67]:
              - generic [ref=e68]: € 10,00
              - generic [ref=e69]: out-of-stock
      - generic [ref=e70]:
        - button "View 2" [ref=e71] [cursor=pointer]
        - button "View 3" [ref=e72] [cursor=pointer]
        - button "View 4" [ref=e73] [cursor=pointer]
      - generic [ref=e74]:
        - generic [ref=e75]:
          - button "Previous artwork" [ref=e76] [cursor=pointer]: ←
          - generic [ref=e77]: 01 / 04
          - button "Next artwork" [ref=e78] [cursor=pointer]: →
        - link "Explore Piece →" [ref=e79] [cursor=pointer]:
          - /url: /dk/products/t-shirt
          - generic [ref=e80]: Explore Piece
          - generic [ref=e81]: →
    - generic [ref=e82]:
      - list
    - generic [ref=e84]:
      - generic [ref=e85]:
        - link "Medusa Store" [ref=e87] [cursor=pointer]:
          - /url: /dk
        - generic [ref=e88]:
          - generic [ref=e89]:
            - generic [ref=e90]: Categories
            - list [ref=e91]:
              - listitem [ref=e92]:
                - link "Sweatshirts" [ref=e93] [cursor=pointer]:
                  - /url: /dk/categories/sweatshirts
                - list
              - listitem [ref=e94]:
                - link "Shirts" [ref=e95] [cursor=pointer]:
                  - /url: /dk/categories/shirts
                - list
              - listitem [ref=e96]:
                - link "Pants" [ref=e97] [cursor=pointer]:
                  - /url: /dk/categories/pants
                - list
              - listitem [ref=e98]:
                - link "Merch" [ref=e99] [cursor=pointer]:
                  - /url: /dk/categories/merch
                - list
          - generic [ref=e100]:
            - generic [ref=e101]: Medusa
            - list [ref=e102]:
              - listitem [ref=e103]:
                - link "GitHub" [ref=e104] [cursor=pointer]:
                  - /url: https://github.com/medusajs
              - listitem [ref=e105]:
                - link "Documentation" [ref=e106] [cursor=pointer]:
                  - /url: https://docs.medusajs.com
              - listitem [ref=e107]:
                - link "Source code" [ref=e108] [cursor=pointer]:
                  - /url: https://github.com/medusajs/dtc-starter
      - generic [ref=e109]:
        - paragraph [ref=e110]: © 2026 Medusa Store. All rights reserved.
        - paragraph [ref=e111]:
          - text: Powered by
          - link [ref=e112] [cursor=pointer]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link [ref=e115] [cursor=pointer]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e123] [cursor=pointer]
  - alert [ref=e127]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Gallery Hero Fallback Mode", () => {
  4  |   test("renders standard commercial Hero when feature flag is off", async ({
  5  |     page,
  6  |   }) => {
  7  |     await page.goto("/dk");
  8  |     const headerNav = page.locator("header");
> 9  |     await expect(headerNav).toBeVisible();
     |                             ^ Error: expect(locator).toBeVisible() failed
  10 |   });
  11 | });
  12 | 
```