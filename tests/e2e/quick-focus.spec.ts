import { expect, test } from "@playwright/test";

test("quick focus route redirects or loads", async ({ page }) => {
  await page.goto("/quick-focus");
  await expect(page).toHaveURL(/login|quick-focus/);
});
