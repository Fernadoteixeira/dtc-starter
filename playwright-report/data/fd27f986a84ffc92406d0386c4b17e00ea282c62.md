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

Expected: < 3000
Received:   3665
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - navigation [ref=e5]:
      - button "Menu" [ref=e12] [cursor=pointer]
      - link "Medusa Store" [ref=e14] [cursor=pointer]:
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
        - link "Medusa Store" [ref=e58] [cursor=pointer]:
          - /url: /dk
        - generic [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]: Categories
            - list [ref=e62]:
              - listitem [ref=e63]:
                - link "Sweatshirts" [ref=e64] [cursor=pointer]:
                  - /url: /dk/categories/sweatshirts
                - list
              - listitem [ref=e65]:
                - link "Shirts" [ref=e66] [cursor=pointer]:
                  - /url: /dk/categories/shirts
                - list
              - listitem [ref=e67]:
                - link "Pants" [ref=e68] [cursor=pointer]:
                  - /url: /dk/categories/pants
                - list
              - listitem [ref=e69]:
                - link "Merch" [ref=e70] [cursor=pointer]:
                  - /url: /dk/categories/merch
                - list
          - generic [ref=e71]:
            - generic [ref=e72]: Medusa
            - list [ref=e73]:
              - listitem [ref=e74]:
                - link "GitHub" [ref=e75] [cursor=pointer]:
                  - /url: https://github.com/medusajs
              - listitem [ref=e76]:
                - link "Documentation" [ref=e77] [cursor=pointer]:
                  - /url: https://docs.medusajs.com
              - listitem [ref=e78]:
                - link "Source code" [ref=e79] [cursor=pointer]:
                  - /url: https://github.com/medusajs/dtc-starter
      - generic [ref=e80]:
        - paragraph [ref=e81]: © 2026 Medusa Store. All rights reserved.
        - paragraph [ref=e82]:
          - text: Powered by
          - link [ref=e83] [cursor=pointer]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link [ref=e86] [cursor=pointer]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e94] [cursor=pointer]
  - alert [ref=e98]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | import AxeBuilder from "@axe-core/playwright"
  3  | 
  4  | test.describe("Automated Accessibility (a11y) & Core Web Vitals Audit", () => {
  5  |   const targetPages = [
  6  |     { name: "Home Page", path: "/" },
  7  |     { name: "Store Page", path: "/us/store" },
  8  |     { name: "Account Page", path: "/us/account" },
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
  30 |     // Assert initial load time is reasonable (< 3000ms)
> 31 |     expect(loadTime).toBeLessThan(3000)
     |                      ^ Error: expect(received).toBeLessThan(expected)
  32 |   })
  33 | })
  34 | 
```