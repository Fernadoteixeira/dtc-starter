# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gallery-accessibility.spec.ts >> Gallery Experience Accessibility >> initial fold meets accessibility guidelines with zero critical violations
- Location: e2e\gallery-accessibility.spec.ts:5:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 86

- Array []
+ Array [
+   Object {
+     "description": "Ensure an element's role supports its ARIA attributes",
+     "help": "Elements must only use supported ARIA attributes",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/aria-allowed-attr?application=playwright",
+     "id": "aria-allowed-attr",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [
+           Object {
+             "data": Array [
+               "aria-selected=\"true\"",
+             ],
+             "id": "aria-allowed-attr",
+             "impact": "critical",
+             "message": "ARIA attribute is not allowed: aria-selected=\"true\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   ARIA attribute is not allowed: aria-selected=\"true\"",
+         "html": "<article class=\"dtc-gallery__card dtc-gallery__card--active\" role=\"region\" aria-label=\"Espiral dourada\" aria-selected=\"true\" tabindex=\"0\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".dtc-gallery__card--active",
+         ],
+       },
+       Object {
+         "all": Array [
+           Object {
+             "data": Array [
+               "aria-selected=\"false\"",
+             ],
+             "id": "aria-allowed-attr",
+             "impact": "critical",
+             "message": "ARIA attribute is not allowed: aria-selected=\"false\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   ARIA attribute is not allowed: aria-selected=\"false\"",
+         "html": "<article class=\"dtc-gallery__card dtc-gallery__card--adjacent\" role=\"button\" aria-label=\"Órbita negra\" aria-selected=\"false\" tabindex=\"0\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".dtc-gallery__card--adjacent",
+         ],
+       },
+       Object {
+         "all": Array [
+           Object {
+             "data": Array [
+               "aria-selected=\"false\"",
+             ],
+             "id": "aria-allowed-attr",
+             "impact": "critical",
+             "message": "ARIA attribute is not allowed: aria-selected=\"false\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "any": Array [],
+         "failureSummary": "Fix all of the following:
+   ARIA attribute is not allowed: aria-selected=\"false\"",
+         "html": "<article class=\"dtc-gallery__card dtc-gallery__card--continuation\" role=\"button\" aria-label=\"Trama solar\" aria-selected=\"false\" tabindex=\"0\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".dtc-gallery__card--continuation",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.aria",
+       "wcag2a",
+       "wcag412",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "RGAAv4",
+       "RGAA-7.1.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - navigation [ref=e5]:
      - button "Menu" [ref=e12] [cursor=pointer]
      - link "Medusa Store" [ref=e14]:
        - /url: /dk
      - generic [ref=e15]:
        - link "Account" [ref=e17]:
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
        - link "Medusa Store" [ref=e60]:
          - /url: /dk
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]: Categories
            - list [ref=e64]:
              - listitem [ref=e65]:
                - link "Sweatshirts" [ref=e66]:
                  - /url: /dk/categories/sweatshirts
                - list
              - listitem [ref=e67]:
                - link "Shirts" [ref=e68]:
                  - /url: /dk/categories/shirts
                - list
              - listitem [ref=e69]:
                - link "Pants" [ref=e70]:
                  - /url: /dk/categories/pants
                - list
              - listitem [ref=e71]:
                - link "Merch" [ref=e72]:
                  - /url: /dk/categories/merch
                - list
          - generic [ref=e73]:
            - generic [ref=e74]: Medusa
            - list [ref=e75]:
              - listitem [ref=e76]:
                - link "GitHub" [ref=e77]:
                  - /url: https://github.com/medusajs
              - listitem [ref=e78]:
                - link "Documentation" [ref=e79]:
                  - /url: https://docs.medusajs.com
              - listitem [ref=e80]:
                - link "Source code" [ref=e81]:
                  - /url: https://github.com/medusajs/dtc-starter
      - generic [ref=e82]:
        - paragraph [ref=e83]: © 2026 Medusa Store. All rights reserved.
        - paragraph [ref=e84]:
          - text: Powered by
          - link [ref=e85]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link [ref=e88]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e96] [cursor=pointer]
  - alert [ref=e102]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | 
  4  | test.describe("Gallery Experience Accessibility", () => {
  5  |   test("initial fold meets accessibility guidelines with zero critical violations", async ({
  6  |     page,
  7  |   }) => {
  8  |     await page.goto("/dk");
  9  |     const accessibilityScanResults = await new AxeBuilder({ page })
  10 |       .include('[data-gallery-experience="true"]')
  11 |       .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  12 |       .analyze();
  13 | 
  14 |     const criticalViolations = accessibilityScanResults.violations.filter(
  15 |       (v) => v.impact === "critical" || v.impact === "serious"
  16 |     );
  17 | 
> 18 |     expect(criticalViolations).toEqual([]);
     |                                ^ Error: expect(received).toEqual(expected) // deep equality
  19 |   });
  20 | });
  21 | 
```