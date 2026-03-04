import { test, expect } from "@playwright/test";

test.describe("Dictx App", () => {
  test("dev server responds with root document", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect
      .poll(() => response?.status(), {
        message: "Root route should return HTTP 200",
      })
      .toBe(200);
  });

  test("page renders shell structure", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveCount(1);
    await expect(page.locator("body")).toHaveCount(1);
    await expect(page.locator("#root")).toHaveCount(1);
    await expect(page).toHaveTitle(/dictx/i);
  });
});
