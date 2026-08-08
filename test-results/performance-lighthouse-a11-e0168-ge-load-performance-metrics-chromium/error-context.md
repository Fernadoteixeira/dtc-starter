# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance\lighthouse-a11y.spec.ts >> Automated Accessibility (a11y) & Core Web Vitals Audit >> should measure initial page load performance metrics
- Location: e2e\performance\lighthouse-a11y.spec.ts:25:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 5000
Received:   5092
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
        - link "Cart (0)" [ref=e20] [cursor=pointer]:
          - /url: /dk/cart
    - region "Fio Vivo Interactive Gallery" [ref=e22]:
      - complementary [ref=e23]:
        - paragraph [ref=e24]: Coleção n.º 01
        - heading "Fio Vivo" [level=1] [ref=e25]
        - paragraph [ref=e26]: O crochê se move
        - text: 01 / 06
      - generic [ref=e28]:
        - group "Espiral dourada" [ref=e29]:
          - img "Espiral dourada - frente" [ref=e31]
          - generic "Alternative views" [ref=e32]:
            - button [ref=e33] [cursor=pointer]:
              - img "Espiral dourada - perfil" [ref=e34]
            - button [ref=e35] [cursor=pointer]:
              - img "Espiral dourada - gesto" [ref=e36]
            - button [ref=e37] [cursor=pointer]:
              - img "Espiral dourada - detalhe" [ref=e38]
          - generic [ref=e39]:
            - generic [ref=e40]: "01"
            - heading "Espiral dourada" [level=2] [ref=e41]
        - button "Órbita negra" [ref=e42] [cursor=pointer]:
          - img "Órbita negra - frente" [ref=e44]
        - button "Trama solar" [ref=e45] [cursor=pointer]:
          - img "Trama solar - frente" [ref=e47]
      - navigation "Gallery pagination" [ref=e48]:
        - generic [ref=e49]:
          - button "Previous artwork" [ref=e50] [cursor=pointer]: ←
          - tablist:
            - tab "Go to artwork 1" [selected]
            - tab "Go to artwork 2"
            - tab "Go to artwork 3"
            - tab "Go to artwork 4"
            - tab "Go to artwork 5"
            - tab "Go to artwork 6"
          - button "Next artwork" [ref=e51] [cursor=pointer]: →
      - button "Conhecer a peça" [ref=e53] [cursor=pointer]
    - generic [ref=e54]:
      - list
    - generic [ref=e56]:
      - generic [ref=e57]:
        - link "Medusa Store" [ref=e59] [cursor=pointer]:
          - /url: /dk
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]: Categories
            - list [ref=e63]:
              - listitem [ref=e64]:
                - link "Sweatshirts" [ref=e65] [cursor=pointer]:
                  - /url: /dk/categories/sweatshirts
                - list
              - listitem [ref=e66]:
                - link "Shirts" [ref=e67] [cursor=pointer]:
                  - /url: /dk/categories/shirts
                - list
              - listitem [ref=e68]:
                - link "Pants" [ref=e69] [cursor=pointer]:
                  - /url: /dk/categories/pants
                - list
              - listitem [ref=e70]:
                - link "Merch" [ref=e71] [cursor=pointer]:
                  - /url: /dk/categories/merch
                - list
          - generic [ref=e72]:
            - generic [ref=e73]: Medusa
            - list [ref=e74]:
              - listitem [ref=e75]:
                - link "GitHub" [ref=e76] [cursor=pointer]:
                  - /url: https://github.com/medusajs
              - listitem [ref=e77]:
                - link "Documentation" [ref=e78] [cursor=pointer]:
                  - /url: https://docs.medusajs.com
              - listitem [ref=e79]:
                - link "Source code" [ref=e80] [cursor=pointer]:
                  - /url: https://github.com/medusajs/dtc-starter
      - generic [ref=e81]:
        - paragraph [ref=e82]: © 2026 Medusa Store. All rights reserved.
        - paragraph [ref=e83]:
          - text: Powered by
          - link "Medusa Website" [ref=e84] [cursor=pointer]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link "Next.js Website" [ref=e87] [cursor=pointer]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e95] [cursor=pointer]
  - alert [ref=e99]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | import AxeBuilder from "@axe-core/playwright"
  3  | 
  4  | test.describe("Automated Accessibility (a11y) & Core Web Vitals Audit", () => {
  5  |   const targetPages = [
  6  |     { name: "Home Page", path: "/dk" },
  7  |     { name: "Store Page", path: "/dk/store" },
  8  |     { name: "Account Page", path: "/dk/account" },
  9  |   ]
  10 | 
  11 |   for (const target of targetPages) {
  12 |     test(`should have no critical accessibility violations on ${target.name}`, async ({ page }) => {
  13 |       await page.goto(target.path)
  14 | 
  15 |       // Run axe accessibility analysis
  16 |       const accessibilityScanResults = await new AxeBuilder({ page })
  17 |         .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  18 |         .disableRules(["color-contrast"]) // Optional: disable specific non-critical rules if needed
  19 |         .analyze()
  20 | 
  21 |       expect(accessibilityScanResults.violations).toEqual([])
  22 |     })
  23 |   }
  24 | 
  25 |   test("should measure initial page load performance metrics", async ({ page }) => {
  26 |     const startTime = Date.now()
  27 |     await page.goto("/")
  28 |     const loadTime = Date.now() - startTime
  29 | 
  30 |     // Assert initial load time is reasonable (< 5000ms for dev server / emulated mobile)
> 31 |     expect(loadTime).toBeLessThan(5000)
     |                      ^ Error: expect(received).toBeLessThan(expected)
  32 |   })
  33 | })
  34 | 
```