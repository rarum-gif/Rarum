import { expect, test } from "@playwright/test";

test("Mobile Darstellung: Navigation und Quiz", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const menu = page.getByRole("dialog", { name: "Menü" });
  await expect(menu.getByRole("link", { name: /Rangliste/ })).toBeVisible();
  await expect(menu.getByRole("link", { name: /Ranked/ })).toBeVisible();
  const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(homeOverflow).toBe(false);
  await page.goto("/play?mode=unlimited");
  await page.getByRole("button", { name: /Los geht's/ }).click();
  await expect(page.getByLabel("Deine Antwort")).toBeVisible({ timeout: 10_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
