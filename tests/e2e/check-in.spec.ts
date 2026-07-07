import { expect, test } from "@playwright/test";

test("check-in route redirects or loads", async ({ page }) => {
  await page.goto("/check-in");
  await expect(page).toHaveURL(/login|check-in/);
});
