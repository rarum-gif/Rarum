import { expect, test } from "@playwright/test";

test("Mobile Darstellung: Navigation und Quiz", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("rarum.v1.character", JSON.stringify({ preset: "mara", skin: "s2", hair: "ponytail", hairColor: "black", facial: "none", backdrop: "sunset", top: "tee-weiss", head: null, eyes: null, neck: null, ears: null })));
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
  for (const path of ["/grundstueck", "/shop", "/figur", "/weltkarte", "/premium"]) {
    await page.goto(path);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), path).toBe(false);
  }
});
