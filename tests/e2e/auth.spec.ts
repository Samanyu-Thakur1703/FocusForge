import { expect, test } from "@playwright/test";

test("login route loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Login")).toBeVisible();
});
