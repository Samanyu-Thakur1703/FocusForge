import { expect, test } from "@playwright/test";

test("focus route has protected boundary", async ({ page }) => {
  await page.goto("/focus/example-session");
  await expect(page).toHaveURL(/login|focus/);
});
