import { describe, expect, it } from "vitest";
import { evaluateAnswer, GRACE_MS } from "@/lib/game/scoring";
import { seedContent } from "@/content";


const content = seedContent();
const q = content.questions.find((x) => x.id === "geografie-hauptstadt-europa")!;
const s = content.settings;

describe("evaluateAnswer", () => {
  it("vergibt Punkte gemäss Seltenheitsstufe", () => {
    expect(evaluateAnswer(s, q, "Paris", { elapsedMs: 1000 })).toMatchObject({ status: "accepted", tier: "known", points: 10 });
    expect(evaluateAnswer(s, q, "Bern", { elapsedMs: 1000 })).toMatchObject({ tier: "familiar", points: 20 });
    expect(evaluateAnswer(s, q, "tallinn", { elapsedMs: 1000 })).toMatchObject({ tier: "rare", points: 55 });
    expect(evaluateAnswer(s, q, "Vaduz", { elapsedMs: 1000 })).toMatchObject({ tier: "very_rare", points: 80 });
  });
  it("nutzt geänderte Punktwerte aus den Einstellungen", () => {
    const custom = { ...s, tiers: s.tiers.map((t) => (t.id === "known" ? { ...t, points: 5 } : t)) };
    expect(evaluateAnswer(custom, q, "Paris", { elapsedMs: 0 }).points).toBe(5);
  });
  it("gibt 0 Punkte für leere, unbekannte, falsche und zu späte Antworten", () => {
    expect(evaluateAnswer(s, q, "", { elapsedMs: 1000 })).toMatchObject({ status: "empty", points: 0 });
    expect(evaluateAnswer(s, q, "Gondor", { elapsedMs: 1000 })).toMatchObject({ status: "unknown", points: 0 });
    expect(evaluateAnswer(s, q, "Zürich", { elapsedMs: 1000 })).toMatchObject({ status: "known_wrong", points: 0 });
    expect(evaluateAnswer(s, q, "Paris", { elapsedMs: 25_000 + GRACE_MS + 1 })).toMatchObject({ status: "timeout", points: 0 });
  });
  it("akzeptiert Auto-Submit knapp nach Ablauf innerhalb der Kulanz", () => {
    expect(evaluateAnswer(s, q, "Paris", { elapsedMs: 25_500 }).status).toBe("accepted");
  });
});

import { rankedDelta, rankedFromAttempts, divisionFor } from "@/lib/game/ranked";
import { stageFor, formatCash, STAGES } from "@/lib/game/wealth";
import { matchAnswer } from "@/lib/game/matching";


describe("Ranked & Vermögen", () => {
  it("berechnet RP-Deltas mit Grenzen", () => {
    expect(rankedDelta(220)).toBe(0);
    expect(rankedDelta(700)).toBe(60);
    expect(rankedDelta(0)).toBe(-25);
    expect(divisionFor(1000).division.id).toBe("bronze");
    expect(divisionFor(1160).division.id).toBe("gold");
  });
  it("summiert nur Ranked-Runden der laufenden Saison", () => {
    const base = { official: false, setId: null, date: null, packId: null, maxTotal: 700, answers: [], finishedAt: "" };
    const r = rankedFromAttempts([
      { ...base, id: "a", mode: "ranked", total: 520, startedAt: "2026-11-16T10:00:00Z" },
      { ...base, id: "b", mode: "ranked", total: 700, startedAt: "2026-11-01T10:00:00Z" },
      { ...base, id: "c", mode: "unlimited", total: 900, startedAt: "2026-11-16T11:00:00Z" },
    ], "2026-11-15T23:00:00Z");
    expect(r).toMatchObject({ rp: 1050, matches: 1, best: 520 });
  });
  it("führt durch die Vermögensleiter", () => {
    expect(stageFor(0, 700).stage.id).toBe("broke");
    expect(stageFor(700, 700).stage.id).toBe("island");
    expect(stageFor(350, 700).index).toBeGreaterThan(3);
    expect(STAGES.every((s, i) => i === 0 || s.at > STAGES[i - 1].at)).toBe(true);
    expect(formatCash(1_250_000)).toBe("$1.25M");
    expect(formatCash(42_000)).toBe("$42K");
  });
  it("erkennt Nachnamen und erweiterte Antworten", () => {
    const qs = seedContent().questions;
    const q = (id: string) => qs.find((x) => x.id === id)!;
    const ok = (id: string, input: string) => matchAnswer(q(id), input).kind === "answer";
    expect(ok("geschichte-us-praesident", "Roosevelt")).toBe(true);
    expect(ok("allgemeinwissen-chemisches-element", "Natrium")).toBe(true);
    expect(ok("allgemeinwissen-chemisches-element", "Oganesson")).toBe(true);
    expect(ok("essen-trinken-gewuerz", "Oregano")).toBe(true);
    expect(ok("allgemeinwissen-chemisches-element", "Wasser")).toBe(false);
  });
});

describe("Saison", () => {
  it("berechnet die ISO-Kalenderwoche", async () => {
    const { season } = await import("@/lib/game/ranked");
    expect(season("2026-11-17").week).toBe(47);
    expect(season("2026-01-01").week).toBe(1);
    expect(season("2027-01-01").week).toBe(53);
    expect(season("2026-11-17").startKey).toBe("2026-11-16");
  });
});

describe("Wirtschaft", () => {
  it("zahlt Geld pro richtiger Antwort, XP pro Runde und steigert das Level", async () => {
    const { computeEconomy, cashForAnswer, levelForXp, canBuy, SHOP } = await import("@/lib/game/economy");
    expect(cashForAnswer("known", 1)).toBe(50);
    expect(cashForAnswer("legendary", 11)).toBe(800);
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(250).level).toBe(2);
    const ans = (status: "accepted" | "unknown", tier: "known" | "rare" | null) => ({ questionId: "q", prompt: "", packId: "p", input: "", status, answerText: null, tier, points: 0 });
    const base = { official: true, setId: "s", date: "2026-11-17", packId: null, maxTotal: 700, total: 0 };
    const eco = computeEconomy([
      { ...base, id: "a", mode: "daily", answers: [ans("accepted", "known"), ans("accepted", "rare"), ans("unknown", null)], startedAt: "2026-11-17T08:00:00Z", finishedAt: "2026-11-17T08:05:00Z" },
    ]);
    expect(eco.earned).toBe(230);
    expect(eco.xp).toBe(130);
    const hut = SHOP.find((i) => i.id === "beach-hut")!;
    expect(canBuy(hut, eco, [])).toBe("Nicht genug Geld.");
    expect(canBuy(hut, { ...eco, earned: 1000 }, [])).toBeNull();
    expect(canBuy(SHOP.find((i) => i.id === "island")!, eco, [])).toMatch(/Level/);
  });
  it("erzeugt schwierige Buchstaben-Varianten mit erklärten Fehlantworten", () => {
    const qs = seedContent().questions;
    const v = qs.filter((q) => q.id.includes("-buchstabe-"));
    expect(v.length).toBeGreaterThan(40);
    const any = v[0];
    expect(any.difficulty).toBe(3);
    expect(any.answers.every((a) => any.prompt.includes(`„${a.text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^[^A-Za-z0-9]+/, "")[0].toUpperCase()}“`))).toBe(true);
    expect((any.wrongAnswers ?? []).some((w) => w.explanation.includes("beginnt nicht"))).toBe(true);
  });
});

describe("Runde 4: spezifische Fragen, Avatare", () => {
  const qs = seedContent().questions;
  const byId = (id: string) => qs.find((x) => x.id === id)!;
  it("behält redaktionelle Stufen vor #auto und führt Dubletten zusammen", () => {
    const queen = byId("musik-queen-song");
    expect(queen.answers.find((a) => a.text === "Bohemian Rhapsody")!.tier).toBe("known");
    expect(queen.answers.find((a) => a.text === "Machines")!.tier).not.toBe("known");
    const texts = queen.answers.map((a) => a.text.toLowerCase());
    expect(new Set(texts).size).toBe(texts.length);
  });
  it("wertet richtige, vertippte und falsche Antworten korrekt", () => {
    const nolan = byId("filme-serien-nolan-film");
    expect(evaluateAnswer(s, nolan, "Interstelar", { elapsedMs: 1000 }).status).toBe("accepted");
    expect(evaluateAnswer(s, nolan, "Titanic", { elapsedMs: 1000 }).points).toBe(0);
    const mcu = byId("filme-serien-mcu-film");
    expect(evaluateAnswer(s, mcu, "Deadpool", { elapsedMs: 1000 }).status).toBe("known_wrong");
    expect(evaluateAnswer(s, mcu, "Deadpool & Wolverine", { elapsedMs: 1000 }).status).toBe("accepted");
    const bb = byId("filme-serien-breaking-bad-figur");
    expect(evaluateAnswer(s, bb, "Heisenberg", { elapsedMs: 1000 }).answerText).toBe("Walter White");
    expect(evaluateAnswer(s, bb, "Kim Wexler", { elapsedMs: 1000 }).status).toBe("known_wrong");
  });
  it("zählt Allerweltswörter nicht als Kurznamen", () => {
    const simpsons = byId("filme-serien-simpsons-figur");
    expect(evaluateAnswer(s, simpsons, "man", { elapsedMs: 1000 }).points).toBe(0);
    expect(evaluateAnswer(s, simpsons, "Homer", { elapsedMs: 1000 }).status).toBe("accepted");
  });
  it("prüft zusammengesetzte und alte Avatare", async () => {
    const { isValidAvatar, parseAvatar } = await import("@/lib/avatars");
    expect(isValidAvatar("crown.sunset")).toBe(true);
    expect(isValidAvatar("fern")).toBe(true);
    expect(isValidAvatar("crown.pink-elephant")).toBe(false);
    expect(isValidAvatar("<script>")).toBe(false);
    expect(parseAvatar("rocket.ocean")).toMatchObject({ icon: "rocket", color: "ocean" });
    expect(parseAvatar("fern").icon).toBe("leaf");
  });
});

describe("Spielwelt: Shop, Figur, Grundstück, Weltkarte", () => {
  it("stapelbare Deko, Premium-Sperre und Gratis-Kleidung", async () => {
    const { canBuy, ownedCount, computeEconomy, SHOP } = await import("@/lib/game/economy");
    const eco = { ...computeEconomy([]), earned: 100000 };
    const palm = SHOP.find((i) => i.id === "palme")!;
    const buys = Array.from({ length: 16 }, () => ({ itemId: "palme", price: 150, at: "" }));
    expect(canBuy(palm, eco, buys.slice(0, 3))).toBeNull();
    expect(canBuy(palm, eco, buys)).toMatch(/Maximal/);
    const neon = SHOP.find((i) => i.id === "neonpalme")!;
    // Bezahlfunktionen sind standardmässig aus: Premium-Gegenstände sind für alle kaufbar
    expect(canBuy(neon, { ...eco, level: { ...eco.level, level: 10 } }, [])).toBeNull();
    expect(canBuy(neon, { ...eco, level: { ...eco.level, level: 10 } }, [], true)).toBeNull();
    expect(ownedCount([], "tee-weiss")).toBe(1);
  });
  it("prüft die Spielfigur gegen den Besitz", async () => {
    const { validateCharacter, PRESETS } = await import("@/lib/game/character");
    const base = { ...PRESETS[0] };
    expect(typeof validateCharacter(base, () => false)).toBe("object");
    expect(validateCharacter({ ...base, head: "krone" }, () => false)).toMatch(/besitzt/);
    expect(typeof validateCharacter({ ...base, head: "krone" }, (id) => id === "krone")).toBe("object");
    expect(validateCharacter({ ...base, top: "cap" }, () => true)).toMatch(/besitzt/);
    expect(validateCharacter({ ...base, skin: "<x>" }, () => true)).toMatch(/Ungültig/);
  });
  it("prüft Grundstück: Besitz, Grenzen, Überlappung, Böden", async () => {
    const { validateEstate, plotSize, findFreeSpot } = await import("@/lib/game/estate");
    const purchases = [{ itemId: "pool", price: 4000, at: "" }, { itemId: "palme", price: 150, at: "" }, { itemId: "weg", price: 20, at: "" }];
    expect(plotSize(purchases)).toBe(8);
    expect(plotSize([...purchases, { itemId: "plot-12", price: 1, at: "" }])).toBe(12);
    const ok = validateEstate({ env: "strand", items: [{ uid: "a", id: "pool", x: 0, y: 0 }, { uid: "b", id: "palme", x: 3, y: 3 }, { uid: "c", id: "weg", x: 3, y: 3 }] }, purchases);
    expect(typeof ok).toBe("object");
    expect(validateEstate({ env: "strand", items: [{ uid: "a", id: "pool", x: 0, y: 0 }, { uid: "b", id: "palme", x: 1, y: 1 }] }, purchases)).toMatch(/überlappen/);
    expect(validateEstate({ env: "strand", items: [{ uid: "a", id: "pool", x: 7, y: 0 }] }, purchases)).toMatch(/Ausserhalb/);
    expect(validateEstate({ env: "strand", items: [{ uid: "a", id: "villa", x: 0, y: 0 }] }, purchases)).toMatch(/genug/);
    expect(validateEstate({ env: "neon", items: [] }, purchases)).toMatch(/Umgebung/);
    expect(findFreeSpot({ env: "strand", items: [{ uid: "a", id: "pool", x: 0, y: 0 }] }, "palme", 8)).toEqual({ x: 2, y: 0 });
  });
  it("wertet Weltkarten-Tipps nach Entfernung", async () => {
    const { haversineKm, geoPoints } = await import("@/lib/game/geo");
    expect(Math.round(haversineKm(47.37, 8.54, 46.95, 7.45))).toBeGreaterThan(90);
    expect(Math.round(haversineKm(47.37, 8.54, 46.95, 7.45))).toBeLessThan(100);
    expect(geoPoints(10)).toBe(100);
    expect(geoPoints(650)).toBeGreaterThan(45);
    expect(geoPoints(20000)).toBe(0);
  });
  it("freie Runden zahlen einen Viertel, Saisons belohnen", async () => {
    const { cashFactor, computeEconomy } = await import("@/lib/game/economy");
    expect(cashFactor({ mode: "training", official: false, finishedAt: "2026-12-01T00:00:00Z", startedAt: "" })).toBe(0.25);
    expect(cashFactor({ mode: "training", official: false, finishedAt: "2026-11-10T00:00:00Z", startedAt: "" })).toBe(1);
    expect(cashFactor({ mode: "daily", official: true, finishedAt: "2026-12-01T00:00:00Z", startedAt: "" })).toBe(1);
    const ranked = (day: number, total: number) => ({ id: `r${day}`, mode: "ranked" as const, official: false, setId: null, date: null, packId: null, total, maxTotal: 700, answers: [], startedAt: `2026-11-${String(day).padStart(2, "0")}T10:00:00Z`, finishedAt: `2026-11-${String(day).padStart(2, "0")}T10:05:00Z` });
    const eco = computeEconomy([ranked(9, 700), ranked(10, 700), ranked(11, 700)], new Date("2026-11-20T00:00:00Z"));
    expect(eco.seasons).toHaveLength(1);
    expect(eco.seasons[0].division.id).toBe("gold");
    expect(eco.seasonRewards).toBe(4000);
  });
});
