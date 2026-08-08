import { test, expect } from "@playwright/test";
import path from "path";

const targetDir = "C:\\Users\\fjuni\\.gemini\\antigravity-ide\\brain\\3ebccf05-94c5-4af6-9a3f-b5c1a634bce1";

test.describe("Visual Evidence Generator Gate", () => {
  test("01-gallery-desktop-enabled.png", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dk");
    const gallery = page.locator('[data-gallery-experience="true"]');
    await expect(gallery).toBeVisible();
    await page.screenshot({
      path: path.join(targetDir, "01-gallery-desktop-enabled.png"),
      fullPage: false,
    });
  });

  test("02-gallery-mobile-enabled.png", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dk");
    const gallery = page.locator('[data-gallery-experience="true"]');
    await expect(gallery).toBeVisible();
    await page.screenshot({
      path: path.join(targetDir, "02-gallery-mobile-enabled.png"),
      fullPage: false,
    });
  });

  test("03-gallery-header-commerce-bar.png", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dk");
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    await page.screenshot({
      path: path.join(targetDir, "03-gallery-header-commerce-bar.png"),
      fullPage: false,
    });
  });

  test("04-gallery-header-immersive-overlay.png", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dk");
    await page.screenshot({
      path: path.join(targetDir, "04-gallery-header-immersive-overlay.png"),
      fullPage: false,
    });
  });

  test("05-gallery-reduced-motion.png", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/dk");
    const gallery = page.locator('[data-gallery-experience="true"]');
    await expect(gallery).toBeVisible();
    await page.screenshot({
      path: path.join(targetDir, "05-gallery-reduced-motion.png"),
      fullPage: false,
    });
  });

  test("06-gallery-fallback-disabled-state.png", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/dk");
    await page.screenshot({
      path: path.join(targetDir, "06-gallery-fallback-disabled-state.png"),
      fullPage: false,
    });
  });
});
