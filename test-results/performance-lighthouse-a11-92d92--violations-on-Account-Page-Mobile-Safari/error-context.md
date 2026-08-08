# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: performance\lighthouse-a11y.spec.ts >> Automated Accessibility (a11y) & Core Web Vitals Audit >> should have no critical accessibility violations on Account Page
- Location: e2e\performance\lighthouse-a11y.spec.ts:12:9

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 190

- Array []
+ Array [
+   Object {
+     "description": "Ensure buttons have discernible text",
+     "help": "Buttons must have discernible text",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/button-name?application=playwright",
+     "id": "button-name",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "button-has-visible-text",
+             "impact": "critical",
+             "message": "Element does not have inner text that is visible to screen readers",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "implicit-label",
+             "impact": "critical",
+             "message": "Element does not have an implicit (wrapped) <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "explicit-label",
+             "impact": "critical",
+             "message": "Element does not have an explicit <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have inner text that is visible to screen readers
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element does not have an implicit (wrapped) <label>
+   Element does not have an explicit <label>
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<button type=\"button\" class=\"text-ui-fg-subtle px-4 focus:outline-none transition-all duration-150 outline-none focus:text-ui-fg-base absolute right-0 top-3\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           ".outline-none",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.name-role-value",
+       "wcag2a",
+       "wcag412",
+       "section508",
+       "section508.22.a",
+       "TTv5",
+       "TT6.a",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "ACT",
+       "RGAAv4",
+       "RGAA-11.9.1",
+     ],
+   },
+   Object {
+     "description": "Ensure every form element has a label",
+     "help": "Form elements must have labels",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/label?application=playwright",
+     "id": "label",
+     "impact": "critical",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": null,
+             "id": "implicit-label",
+             "impact": "critical",
+             "message": "Element does not have an implicit (wrapped) <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "explicit-label",
+             "impact": "critical",
+             "message": "Element does not have an explicit <label>",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-label",
+             "impact": "critical",
+             "message": "aria-label attribute does not exist or is empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "aria-labelledby",
+             "impact": "critical",
+             "message": "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "noAttr",
+             },
+             "id": "non-empty-title",
+             "impact": "critical",
+             "message": "Element has no title attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": Object {
+               "messageKey": "emptyAttr",
+             },
+             "id": "non-empty-placeholder",
+             "impact": "critical",
+             "message": "Element has an empty placeholder attribute",
+             "relatedNodes": Array [],
+           },
+           Object {
+             "data": null,
+             "id": "presentational-role",
+             "impact": "critical",
+             "message": "Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+             "relatedNodes": Array [],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element does not have an implicit (wrapped) <label>
+   Element does not have an explicit <label>
+   aria-label attribute does not exist or is empty
+   aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
+   Element has no title attribute
+   Element has an empty placeholder attribute
+   Element's default semantics were not overridden with role=\"none\" or role=\"presentation\"",
+         "html": "<input type=\"password\" placeholder=\" \" required=\"\" class=\"pt-4 pb-1 block w-fu...\" autocomplete=\"current-password\" data-testid=\"password-input\" name=\"password\">",
+         "impact": "critical",
+         "none": Array [],
+         "target": Array [
+           "input[type=\"password\"]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.forms",
+       "wcag2a",
+       "wcag412",
+       "section508",
+       "section508.22.n",
+       "TTv5",
+       "TT5.c",
+       "EN-301-549",
+       "EN-9.4.1.2",
+       "ACT",
+       "RGAAv4",
+       "RGAA-11.1.1",
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
      - link "Cart (0)" [ref=e18]:
        - /url: /dk/cart
    - generic [ref=e20]:
      - generic [ref=e24]:
        - heading "Welcome back" [level=1] [ref=e25]
        - paragraph [ref=e26]: Sign in to access an enhanced shopping experience.
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e30]:
              - textbox "Enter a valid email address." [ref=e31]:
                - /placeholder: " "
              - generic [ref=e32]:
                - text: Email
                - generic [ref=e33]: "*"
            - generic [ref=e35]:
              - textbox [ref=e36]:
                - /placeholder: " "
              - generic [ref=e37]:
                - text: Password
                - generic [ref=e38]: "*"
              - button [ref=e39] [cursor=pointer]
          - button "Sign in" [ref=e43] [cursor=pointer]
        - generic [ref=e44]:
          - text: Not a member?
          - button "Join us" [ref=e45] [cursor=pointer]
          - text: .
      - generic [ref=e46]:
        - generic [ref=e47]:
          - heading "Got questions?" [level=3] [ref=e48]
          - text: You can find frequently asked questions and answers on our customer service page.
        - link [ref=e50]:
          - /url: /dk/customer-service
          - paragraph [ref=e51]: Customer Service
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
          - link "Medusa Website" [ref=e83]:
            - /url: https://www.medusajs.com
          - text: "&"
          - link "Next.js Website" [ref=e86]:
            - /url: https://nextjs.org
  - button "Open Next.js Dev Tools" [ref=e94] [cursor=pointer]
  - alert [ref=e100]
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
> 21 |       expect(accessibilityScanResults.violations).toEqual([])
     |                                                   ^ Error: expect(received).toEqual(expected) // deep equality
  22 |     })
  23 |   }
  24 | 
  25 |   test("should measure initial page load performance metrics", async ({ page }) => {
  26 |     const startTime = Date.now()
  27 |     await page.goto("/")
  28 |     const loadTime = Date.now() - startTime
  29 | 
  30 |     // Assert initial load time is reasonable (< 5000ms for dev server / emulated mobile)
  31 |     expect(loadTime).toBeLessThan(5000)
  32 |   })
  33 | })
  34 | 
```