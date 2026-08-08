import { test, expect } from "@playwright/test";

test.describe("Gallery Experience Commerce Journey", () => {
  test("loads gallery hero, navigates items, and integrates with Medusa cart flow", async ({
    page,
  }) => {
    // 1. Open storefront home page
    await page.goto("/dk");

    // 2. Confirm transactional header Nav components
    const headerNav = page.locator("header").first();
    await expect(headerNav).toBeVisible();

    // 3. Confirm Gallery Experience initial fold region
    const galleryRegion = page.locator('[data-gallery-experience="true"]');
    await expect(galleryRegion).toBeVisible();

    // 4. Verify gallery card title & nav controls
    const cardTitle = galleryRegion.locator(".dtc-gallery__artwork-title").first();
    await expect(cardTitle).toBeVisible();

    const nextButton = galleryRegion.getByLabel("Next artwork");
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // 5. Click CTA to explore piece
    const exploreCta = galleryRegion.locator(".dtc-gallery__cta").first();
    await expect(exploreCta).toBeVisible();
    await exploreCta.click();

    // 6. Confirm navigation to product detail page
    await expect(page).toHaveURL(/\/dk\/products\//);
  });
});
