import { expect, test } from "@playwright/test";

test("Mobile Darstellung: Navigation und Quiz", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigation" });
  await expect(nav).toBeVisible();
  await nav.getByRole("button", { name: "Mehr" }).click();
  await expect(page.getByRole("link", { name: "Rangliste" }).last()).toBeVisible();
  await page.goto("/play?mode=unlimited");
  await page.getByRole("button", { name: /Los geht's/ }).click();
  await expect(page.getByLabel("Deine Antwort")).toBeVisible({ timeout: 10_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
