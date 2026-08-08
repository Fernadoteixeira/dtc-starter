# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-evidence-generator.spec.ts >> Visual Evidence Generator Gate >> 02-gallery-mobile-enabled.png
- Location: e2e\visual-evidence-generator.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:8000/dk", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import path from "path";
  3  | 
  4  | const targetDir = "C:\\Users\\fjuni\\.gemini\\antigravity-ide\\brain\\94a4d943-0f46-4dc7-9f6e-05559bcb84be";
  5  | 
  6  | test.describe("Visual Evidence Generator Gate", () => {
  7  |   test("01-gallery-desktop-enabled.png", async ({ page }) => {
  8  |     await page.setViewportSize({ width: 1280, height: 800 });
  9  |     await page.goto("/dk");
  10 |     const gallery = page.locator('[data-gallery-experience="true"]');
  11 |     await expect(gallery).toBeVisible();
  12 |     await page.screenshot({
  13 |       path: path.join(targetDir, "01-gallery-desktop-enabled.png"),
  14 |       fullPage: false,
  15 |     });
  16 |   });
  17 | 
  18 |   test("02-gallery-mobile-enabled.png", async ({ page }) => {
  19 |     await page.setViewportSize({ width: 375, height: 812 });
> 20 |     await page.goto("/dk");
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  21 |     const gallery = page.locator('[data-gallery-experience="true"]');
  22 |     await expect(gallery).toBeVisible();
  23 |     await page.screenshot({
  24 |       path: path.join(targetDir, "02-gallery-mobile-enabled.png"),
  25 |       fullPage: false,
  26 |     });
  27 |   });
  28 | 
  29 |   test("03-gallery-header-commerce-bar.png", async ({ page }) => {
  30 |     await page.setViewportSize({ width: 1280, height: 800 });
  31 |     await page.goto("/dk");
  32 |     const header = page.locator("header").first();
  33 |     await expect(header).toBeVisible();
  34 |     await page.screenshot({
  35 |       path: path.join(targetDir, "03-gallery-header-commerce-bar.png"),
  36 |       fullPage: false,
  37 |     });
  38 |   });
  39 | 
  40 |   test("04-gallery-header-immersive-overlay.png", async ({ page }) => {
  41 |     await page.setViewportSize({ width: 1280, height: 800 });
  42 |     await page.goto("/dk");
  43 |     await page.screenshot({
  44 |       path: path.join(targetDir, "04-gallery-header-immersive-overlay.png"),
  45 |       fullPage: false,
  46 |     });
  47 |   });
  48 | 
  49 |   test("05-gallery-reduced-motion.png", async ({ page }) => {
  50 |     await page.emulateMedia({ reducedMotion: "reduce" });
  51 |     await page.goto("/dk");
  52 |     const gallery = page.locator('[data-gallery-experience="true"]');
  53 |     await expect(gallery).toBeVisible();
  54 |     await page.screenshot({
  55 |       path: path.join(targetDir, "05-gallery-reduced-motion.png"),
  56 |       fullPage: false,
  57 |     });
  58 |   });
  59 | 
  60 |   test("06-gallery-fallback-disabled-state.png", async ({ page }) => {
  61 |     await page.setViewportSize({ width: 1280, height: 800 });
  62 |     await page.goto("/dk");
  63 |     await page.screenshot({
  64 |       path: path.join(targetDir, "06-gallery-fallback-disabled-state.png"),
  65 |       fullPage: false,
  66 |     });
  67 |   });
  68 | });
  69 | 
```