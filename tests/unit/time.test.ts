import { describe, expect, it } from "vitest";
import { dateKey, nextReset, startOfDay, weekStart } from "@/lib/time";

describe("Zeitzone Europe/Zurich", () => {
  it("wechselt den Tag um Mitternacht Schweizer Zeit", () => {
    expect(dateKey(new Date("2026-11-17T22:59:59Z"))).toBe("2026-11-17");
    expect(dateKey(new Date("2026-11-17T23:00:00Z"))).toBe("2026-11-18");
    expect(nextReset(new Date("2026-11-17T10:00:00Z")).toISOString()).toBe("2026-11-17T23:00:00.000Z");
  });
  it("behandelt Sommerzeit korrekt", () => {
    expect(startOfDay("2026-07-01").toISOString()).toBe("2026-06-30T22:00:00.000Z");
    expect(nextReset(new Date("2026-03-28T12:00:00Z")).toISOString()).toBe("2026-03-28T23:00:00.000Z");
    expect(nextReset(new Date("2026-03-29T12:00:00Z")).toISOString()).toBe("2026-03-29T22:00:00.000Z");
  });
  it("findet den Wochenbeginn (Montag)", () => {
    expect(weekStart("2026-11-22")).toBe("2026-11-16");
  });
});
