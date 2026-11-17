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
