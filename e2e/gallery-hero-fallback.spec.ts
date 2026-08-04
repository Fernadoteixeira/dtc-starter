import { test, expect } from "@playwright/test";

test.describe("Gallery Hero Fallback Mode", () => {
  test("renders standard commercial Hero when feature flag is off", async ({
    page,
  }) => {
    await page.goto("/dk");
    const headerNav = page.locator("header").first();
    await expect(headerNav).toBeVisible();
  });
});
