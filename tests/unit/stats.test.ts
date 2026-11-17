import { describe, expect, it } from "vitest";
import { computeStats, computeStreaks, earnedAchievements, levelFor, defaultLevels } from "@/lib/game/stats";
import { seedPacks } from "@/content/packs";
import type { AttemptRecord } from "@/lib/types";

const daily = (date: string, total: number, official = true): AttemptRecord => ({
  id: date + total + official, mode: "daily", official, setId: `daily:${date}`, date, packId: null, total, maxTotal: 700,
  answers: [{ questionId: "x", prompt: "", packId: "sport", input: "a", status: "accepted", answerText: "a", tier: total > 400 ? "legendary" : "known", points: total }],
  startedAt: date, finishedAt: date + "T10:00:00Z",
});

describe("Streaks", () => {
  it("zählt aufeinanderfolgende Tage, heute ungespielt unterbricht nicht", () => {
    const a = [daily("2026-11-14", 100), daily("2026-11-15", 100), daily("2026-11-16", 100)];
    expect(computeStreaks(a, "2026-11-17")).toEqual({ current: 3, longest: 3, playedToday: false });
    expect(computeStreaks(a, "2026-11-18").current).toBe(0);
  });
  it("zählt Trainingsrunden nicht", () => {
    expect(computeStreaks([daily("2026-11-16", 100, false)], "2026-11-17").current).toBe(0);
  });
});

describe("Statistik und Level", () => {
  it("summiert nur offizielle Punkte", () => {
    const s = computeStats([daily("2026-11-16", 300), daily("2026-11-16", 500, false), daily("2026-11-17", 450)], seedPacks, "2026-11-17");
    expect(s.totalPoints).toBe(750);
    expect(s.bestDaily?.total).toBe(450);
    expect(s.averageDaily).toBe(375);
    expect(s.todayPoints).toBe(450);
  });
  it("berechnet Level aus konfigurierbaren Schwellen", () => {
    expect(levelFor(defaultLevels(), 0).current.name).toBe("Pleite");
    expect(levelFor(defaultLevels(), 1600).current.name).toBe("Kleinunternehmer");
    expect(levelFor(defaultLevels(), 99999).next).toBeNull();
  });
  it("vergibt Abzeichen", () => {
    const at = [daily("2026-11-15", 500), daily("2026-11-16", 300), daily("2026-11-17", 250)];
    const e = earnedAchievements(computeStats(at, seedPacks, "2026-11-17"), at);
    expect(e).toEqual(expect.arrayContaining(["first_challenge", "streak_3", "points_1000", "legendary_1", "score_500", "perfect_daily"]));
    expect(e).not.toContain("streak_7");
  });
});
