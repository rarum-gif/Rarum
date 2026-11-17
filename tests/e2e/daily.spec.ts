import { expect, test } from "@playwright/test";
import { answerCurrent, answerKey } from "./helpers";

test("Daily Challenge: spielen, werten, speichern, keine doppelte Wertung", async ({ page, request }) => {
  const key = await answerKey(request);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Deine heutige Wissens-Challenge wartet/ })).toBeVisible();
  await page.getByRole("link", { name: /Jetzt spielen/ }).click();

  await expect(page.getByText("Offizielle Tageswertung")).toBeVisible();
  await page.getByRole("button", { name: /Los geht's/ }).click();

  const picks = ["known", "alias", "rare", "Atlantis-gibt-es-nicht", "empty", "known", "known"];
  for (let i = 0; i < 7; i++) {
    await expect(page.locator("form h2")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("timer")).toBeVisible();
    await answerCurrent(page, key, picks[i]);
    if (picks[i] === "Atlantis-gibt-es-nicht") {
      await expect(page.getByText("Diese Antwort ist noch nicht in unserer Antwortliste")).toBeVisible();
      await page.getByRole("button", { name: "Antwort melden" }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Melden" }).click();
      await expect(page.getByText("Danke, gemeldet!")).toBeVisible();
    } else if (picks[i] === "empty") {
      await expect(page.getByText("Keine Antwort abgegeben")).toBeVisible();
    } else {
      await expect(page.getByText("Antwort erkannt!")).toBeVisible();
      await expect(page.getByText("Seltenheitsstufe").first()).toBeVisible();
    }
    await page.getByRole("button", { name: i === 6 ? "Ergebnis anzeigen" : "Weiter" }).click();
  }

  await expect(page.getByText("von 700 möglichen Punkten")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Deine Antworten")).toBeVisible();
  await expect(page.locator("ol > li")).toHaveCount(7);

  // Startseite zeigt Ergebnis, Serie und Punkte
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Heutige Challenge geschafft." })).toBeVisible();
  await expect(page.getByTitle("Aktuelle Serie")).toContainText("1");

  // Wiederholung ist nur Training
  await page.goto("/play?mode=daily");
  await expect(page.getByText(/heute schon offiziell gespielt/)).toBeVisible();

  // Gespeichert im Profil
  await page.goto("/profil");
  await expect(page.getByText("Erster Schritt").first()).toBeVisible();

  // Meldung ist im Admin-Bereich sichtbar
  const reports = await (await request.get("/api/admin/reports")).json();
  expect(reports.reports.some((r: { answerText: string }) => r.answerText === "Atlantis-gibt-es-nicht")).toBe(true);
});

test("Neuladen setzt die laufende Frage mit derselben Restzeit fort", async ({ page }) => {
  await page.goto("/play?mode=training&pack=geografie");
  await page.getByRole("button", { name: /Los geht's/ }).click();
  const prompt = await page.locator("form h2").innerText({ timeout: 10_000 });
  await page.waitForTimeout(3000);
  await page.reload();
  await expect(page.locator("form h2")).toHaveText(prompt, { timeout: 10_000 });
  const secs = Number(await page.getByRole("timer").innerText());
  expect(secs).toBeLessThanOrEqual(23);
});

test("Themen-Pack, Archiv und Admin-Zugriff", async ({ page }) => {
  await page.goto("/packs/geografie");
  await expect(page.getByRole("heading", { name: "Geografie", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: /Challenge starten/ }).click();
  await expect(page.getByText(/5 Fragen/)).toBeVisible();

  await page.goto("/archiv");
  await expect(page.getByRole("heading", { name: "Heute" })).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/admin");
  await expect(page.getByPlaceholder("Admin-Passwort")).toBeVisible();
  await page.getByPlaceholder("Admin-Passwort").fill("falsch");
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByText("Falsches Passwort.")).toBeVisible();
  await page.getByPlaceholder("Admin-Passwort").fill("e2e-secret");
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page.getByRole("heading", { name: "Admin-Dashboard" })).toBeVisible();
  await expect(page.getByText("Nenne einen Schweizer Alpenpass.")).toBeVisible();
});

test("Rangliste im Demo-Modus täuscht keine fremden Spieler vor", async ({ page }) => {
  await page.goto("/rangliste");
  await expect(page.getByText("Demo-Modus ohne Server-Datenbank.")).toBeVisible();
});
