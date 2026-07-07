import { expect, test } from "@playwright/test";

test("dashboard route redirects or loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login|dashboard/);
});
