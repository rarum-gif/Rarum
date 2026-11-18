import { expect, test } from "@playwright/test";

// Für alle Tests: Spielfigur ist bereits gewählt (sonst führt die Startseite zur Figurenwahl)
test.beforeEach(async ({ page }, info) => {
  if (info.title.startsWith("Erster Start")) return;
  await page.addInitScript(() => {
    if (!localStorage.getItem("rarum.v1.character"))
      localStorage.setItem("rarum.v1.character", JSON.stringify({ preset: "kai", skin: "s3", hair: "wavy", hairColor: "blond", facial: "stubble", backdrop: "ocean", top: "tank-schwarz", head: null, eyes: null, neck: null, ears: null }));
  });
});
import { answerCurrent, answerKey } from "./helpers";

test("Daily Challenge: spielen, werten, speichern, keine doppelte Wertung", async ({ page, request }) => {
  const key = await answerKey(request);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NNAXOS" })).toBeVisible();
  await page.getByRole("link", { name: /Play now/i }).click();

  await expect(page.getByRole("button", { name: /Los geht's/ })).toBeVisible();
  await page.getByRole("button", { name: /Los geht's/ }).click();

  const picks = ["known", "alias", "rare", "Atlantis-gibt-es-nicht", "empty", "known", "known"];
  for (let i = 0; i < 7; i++) {
    await expect(page.locator("form h2")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("timer")).toBeVisible();
    await answerCurrent(page, key, picks[i]);
    if (picks[i] === "Atlantis-gibt-es-nicht") {
      await expect(page.getByText("Kennen wir noch nicht")).toBeVisible();
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

  await expect(page.getByText("von 700 Punkten")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Verdient", { exact: true })).toBeVisible();
  await expect(page.getByText(/XP · Level/)).toBeVisible();
  await expect(page.getByText("Deine Antworten")).toBeVisible();
  await expect(page.locator("ol > li")).toHaveCount(7);

  // Startseite zeigt Ergebnis, Serie und Punkte
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Heute: \d+ Punkte/ })).toBeVisible();
  await expect(page.getByText("1 Tag", { exact: true })).toBeVisible();

  // Wiederholung ist nur Training
  await page.goto("/play?mode=daily");
  await expect(page.getByText(/Heute schon gespielt/)).toBeVisible();

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

test("Ranked: Match spielen und RP erhalten", async ({ page, request }) => {
  const key = await answerKey(request);
  await page.goto("/ranked");
  await expect(page.getByText("Wochen-Rangliste")).toBeVisible();
  await page.getByRole("link", { name: /Match starten/ }).click();
  await page.getByRole("button", { name: /Los geht's/ }).click();
  for (let i = 0; i < 7; i++) {
    await expect(page.locator("form h2")).toBeVisible({ timeout: 10_000 });
    await answerCurrent(page, key, "rare");
    await expect(page.getByText("Antwort erkannt!")).toBeVisible();
    await page.getByRole("button", { name: i === 6 ? "Ergebnis anzeigen" : "Weiter" }).click();
  }
  await expect(page.getByText(/RP · jetzt \d+/)).toBeVisible({ timeout: 10_000 });
  await page.goto("/ranked");
  await expect(page.getByText("1 Matches", { exact: false }).first()).toBeVisible();
});

test("Shop: Geld verdienen und etwas kaufen", async ({ page, request }) => {
  const key = await answerKey(request);
  await page.goto("/play?mode=training&pack=geografie");
  await page.getByRole("button", { name: /Los geht's/ }).click();
  for (let i = 0; i < 5; i++) {
    await expect(page.locator("form h2")).toBeVisible({ timeout: 10_000 });
    await answerCurrent(page, key, "rare");
    if (i < 4) await page.getByRole("button", { name: "Weiter" }).click();
  }
  // Endlos-Runde nach 5 Fragen selbst beenden
  await page.getByRole("button", { name: "Runde beenden" }).click();
  await expect(page.getByText("Verdient", { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.goto("/shop");
  await page.getByRole("article").filter({ hasText: "Plastik-Flamingo" }).getByRole("button", { name: "Kaufen" }).click();
  await expect(page.getByRole("dialog", { name: "Neu freigeschaltet" })).toBeVisible();
  await page.getByRole("button", { name: "Platzieren" }).click();
  await expect(page).toHaveURL(/grundstueck/);
  // Flamingo aus dem Inventar aufs Grundstück stellen
  await page.getByTitle("Plastik-Flamingo").click();
  await expect(page.getByText("Gespeichert")).toBeVisible();
  await page.reload();
  await expect(page.locator(".estate-item")).toHaveCount(1);
});

test("Profil anpassen: Name, Symbol und Farbe (ohne Konto)", async ({ page }) => {
  await page.goto("/profil");
  await page.getByRole("button", { name: "Profil anpassen" }).click();
  await page.getByLabel("Name").fill("Inselkoenig");
  await page.getByRole("button", { name: "Rakete" }).click();
  await page.getByRole("button", { name: "Ozean" }).click();
  await page.getByRole("button", { name: "Speichern" }).click();
  await expect(page.getByRole("heading", { name: "Inselkoenig" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Inselkoenig" })).toBeVisible();
});

test("Erster Start: Figur wählen und anpassen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/start/);
  await page.getByRole("button", { name: /Zara/ }).click();
  await page.getByRole("button", { name: /Weiter/ }).click();
  await page.getByRole("button", { name: "Afro" }).click();
  await page.getByLabel("Spielername").fill("Inselheldin");
  await page.getByRole("button", { name: /Los geht/ }).click();
  await expect(page.getByRole("heading", { name: "NNAXOS" })).toBeVisible();
  await page.goto("/figur");
  await expect(page.getByRole("heading", { name: "Inselheldin" })).toBeVisible();
  await expect(page.getByText("Die Architektin")).toBeVisible();
});

test("Weltkarte: Ort antippen und Punkte nach Entfernung", async ({ page }) => {
  await page.goto("/play?mode=atlas");
  await page.getByRole("button", { name: /Los geht's/ }).click();
  const map = page.getByRole("application");
  await expect(map).toBeVisible({ timeout: 10_000 });
  await map.click({ position: { x: 300, y: 150 } });
  await page.getByRole("button", { name: "Tipp abgeben" }).click();
  await expect(page.getByRole("heading", { name: / km$|Kein Tipp/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nächster Ort" })).toBeVisible();
});
