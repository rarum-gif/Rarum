import { describe, expect, it } from "vitest";
import { computeMissingSets, isEligible } from "@/lib/game/schedule";
import { seedContent } from "@/content";
import { addDays } from "@/lib/time";

const content = seedContent();
const launch = content.settings.launchDate;

describe("Daily-Content-System", () => {
  const sets = computeMissingSets(content, [], addDays(launch, 20), "2026-01-01T00:00:00Z");

  it("erzeugt pro Tag eine Daily Challenge und ein Set je Pack", () => {
    const day = sets.filter((s) => s.date === launch);
    expect(day.filter((s) => s.kind === "daily")).toHaveLength(1);
    expect(day.filter((s) => s.kind === "pack")).toHaveLength(15);
    expect(day.find((s) => s.kind === "daily")!.items).toHaveLength(7);
  });

  it("ist deterministisch – alle Nutzer erhalten dieselben Fragen", () => {
    const again = computeMissingSets(content, [], addDays(launch, 20), "2026-01-01T00:00:00Z");
    expect(again).toEqual(sets);
  });

  it("verwendet nur geprüfte Fragen", () => {
    const qmap = new Map(content.questions.map((q) => [q.id, q]));
    for (const s of sets) for (const i of s.items) expect(isEligible(qmap.get(i.questionId)!)).toBe(true);
    expect(sets.some((s) => s.items.some((i) => i.questionId === "geografie-alpenpass-entwurf"))).toBe(false);
  });

  it("mischt die Daily Challenge über verschiedene Packs", () => {
    const qmap = new Map(content.questions.map((q) => [q.id, q]));
    const d = sets.find((s) => s.kind === "daily")!;
    expect(new Set(d.items.map((i) => qmap.get(i.questionId)!.packId)).size).toBe(7);
  });

  it("wiederholt Fragen erst, wenn der Bestand erschöpft ist, und markiert sie", () => {
    const daily = sets.filter((s) => s.kind === "daily").sort((a, b) => (a.date < b.date ? -1 : 1));
    const seen = new Set<string>();
    for (const s of daily) {
      for (const i of s.items) {
        expect(i.repeat).toBe(seen.has(i.questionId));
        seen.add(i.questionId);
      }
    }
    // erster Tag: nur neue Fragen; Pack-Sets ab Tag 2 enthalten markierte Wiederholungen
    expect(daily[0].items.every((i) => !i.repeat)).toBe(true);
    const geo2 = sets.find((s) => s.id === `pack:geografie:${addDays(launch, 1)}`)!;
    const geoPool = content.questions.filter((q) => q.packId === "geografie" && q.status === "verified").length;
    expect(geo2.items.filter((i) => !i.repeat).length).toBe(Math.min(5, geoPool - 5));
  });

  it("verändert bereits veröffentlichte Sets nicht, wenn neue Fragen dazukommen", () => {
    const first = computeMissingSets(content, [], addDays(launch, 2));
    const extra = structuredClone(content);
    extra.questions.push({ ...structuredClone(content.questions[0]), id: "allgemeinwissen-neu", prompt: "Neue Frage?" });
    const more = computeMissingSets(extra, first, addDays(launch, 4));
    expect(more.every((s) => s.date > addDays(launch, 2))).toBe(true);
    const next = more.find((s) => s.id === `pack:allgemeinwissen:${addDays(launch, 3)}`)!;
    expect(next.items.some((i) => i.questionId === "allgemeinwissen-neu" && !i.repeat)).toBe(true);
  });

  it("respektiert von Admins geplante Sets", () => {
    const planned = { id: `daily:${addDays(launch, 1)}`, date: addDays(launch, 1), kind: "daily" as const, packId: null, items: [{ questionId: "sport-nba-team", repeat: false }], createdBy: "admin" as const, publishedAt: "" };
    const out = computeMissingSets(content, [planned], addDays(launch, 1));
    expect(out.find((s) => s.id === planned.id)).toBeUndefined();
  });
});
