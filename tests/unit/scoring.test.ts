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
    expect(canBuy(SHOP[0], eco, [])).toBe("Nicht genug Geld.");
    expect(canBuy(SHOP[0], { ...eco, earned: 1000 }, [])).toBeNull();
    expect(canBuy(SHOP[SHOP.length - 1], eco, [])).toMatch(/Level/);
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
