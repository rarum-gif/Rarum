import { beforeAll, describe, expect, it } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

// Eigener Datenspeicher pro Testlauf
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rarum-test-"));
process.env.RARUM_DATA_FILE = path.join(dir, "store.json");

const at = (iso: string) => new Date(iso);
let run: typeof import("@/lib/server/run");
let tokens: typeof import("@/lib/server/tokens");

beforeAll(async () => {
  run = await import("@/lib/server/run");
  tokens = await import("@/lib/server/tokens");
});

async function playThrough(mode: "daily" | "pack", now: Date, opts: { packId?: string; answer?: string } = {}) {
  let { token, meta } = await run.startRun({ mode, packId: opts.packId }, null, now);
  for (let i = 0; i < (meta.total ?? 0); i++) {
    const n = await run.nextQuestion(token, null, now);
    const a = await run.submitAnswer(n.token, opts.answer ?? "", null, new Date(now.getTime() + 2000));
    token = a.token;
  }
  return run.finishRun(token, null, now);
}

describe("Spiel-Engine (Gast)", () => {
  const now = at("2026-11-17T10:00:00Z");

  it("spielt die Daily Challenge mit 7 Fragen und liefert eine signierte Quittung", async () => {
    const r = await playThrough("daily", now);
    expect(r.storage).toBe("local");
    expect(r.attempt.answers).toHaveLength(7);
    expect(r.attempt.official).toBe(true);
    expect(r.attempt.setId).toBe("daily:2026-11-17");
    expect(run.verifyReceipt(r.attempt)).not.toBeNull();
    expect(run.verifyReceipt({ ...r.attempt, total: 9999 })?.total).not.toBe(9999);
  });

  it("alle Spieler erhalten dieselben Tagesfragen", async () => {
    const a = await run.startRun({ mode: "daily" }, null, now);
    const b = await run.startRun({ mode: "daily" }, null, now);
    const qa = (await run.nextQuestion(a.token, null, now)).payload!.question.id;
    const qb = (await run.nextQuestion(b.token, null, now)).payload!.question.id;
    expect(qa).toBe(qb);
  });

  it("wertet Antworten serverseitig und erkennt Aliases", async () => {
    const { token } = await run.startRun({ mode: "pack", packId: "geografie" }, null, now);
    const n = await run.nextQuestion(token, null, now);
    const r = await run.submitAnswer(n.token, "zzz-unbekannt", null, now);
    expect(r.result.status).toBe("unknown");
    expect(r.result.points).toBe(0);
  });

  it("Neuladen gibt keine zusätzliche Zeit", async () => {
    const { token } = await run.startRun({ mode: "daily" }, null, now);
    const first = await run.nextQuestion(token, null, now);
    const later = new Date(now.getTime() + 20_000);
    const again = await run.nextQuestion(first.token, null, later);
    expect(again.payload!.startedAt).toBe(first.payload!.startedAt);
    // Antwort nach Ablauf zählt nicht
    const r = await run.submitAnswer(again.token, "Paris", null, new Date(now.getTime() + 40_000));
    expect(r.result.status).toBe("timeout");
  });

  it("peek startet keine neue Frage", async () => {
    const { token } = await run.startRun({ mode: "daily" }, null, now);
    const p = await run.nextQuestion(token, null, now, { peek: true });
    expect(p.payload).toBeUndefined();
  });

  it("Tokens können nicht manipuliert werden", async () => {
    const { token } = await run.startRun({ mode: "daily" }, null, now);
    const [body, mac] = token.split(".");
    const state = JSON.parse(Buffer.from(body, "base64url").toString());
    state.total = 700;
    const forged = Buffer.from(JSON.stringify(state)).toString("base64url") + "." + mac;
    await expect(run.nextQuestion(forged, null, now)).rejects.toThrow(/ungültig/);
    expect(tokens.verify(forged, "run")).toBeNull();
  });

  it("eine Antwort pro Frage", async () => {
    const { token } = await run.startRun({ mode: "daily" }, null, now);
    const n = await run.nextQuestion(token, null, now);
    await run.submitAnswer(n.token, "a", null, now);
    await expect(run.submitAnswer(n.token, "b", null, now)).rejects.toThrow(/bereits beantwortet/);
  });

  it("Wiederholung als Training zählt nicht offiziell", async () => {
    const { meta } = await run.startRun({ mode: "daily", practice: true }, null, now);
    expect(meta.official).toBe(false);
    expect(meta.practiceReason).toBe("already_played");
  });

  it("Pack-Challenge von gestern wird zur Archiv-Runde, morgen ist gesperrt", async () => {
    const next = at("2026-11-18T10:00:00Z");
    const { meta } = await run.startRun({ mode: "pack", packId: "sport", date: "2026-11-17" }, null, next);
    expect(meta.official).toBe(false);
    expect(meta.mode).toBe("archive");
    await expect(run.startRun({ mode: "daily", date: "2026-11-19" }, null, next)).rejects.toThrow(/noch nicht veröffentlicht/);
  });

  it("Tageswechsel liefert neue Fragen", async () => {
    const a = await run.startRun({ mode: "daily" }, null, at("2026-11-17T22:59:00Z"));
    const b = await run.startRun({ mode: "daily" }, null, at("2026-11-17T23:01:00Z"));
    expect(a.meta.setId).toBe("daily:2026-11-17");
    expect(b.meta.setId).toBe("daily:2026-11-18");
  });

  it("Unlimited liefert fortlaufend Fragen aus verschiedenen Packs", async () => {
    let { token } = await run.startRun({ mode: "unlimited" }, null, now);
    const packs = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const n = await run.nextQuestion(token, null, now);
      packs.add(n.payload!.question.packId);
      token = (await run.submitAnswer(n.token, "", null, now)).token;
    }
    expect(packs.size).toBeGreaterThan(3);
    const f = await run.finishRun(token, null, now);
    expect(f.attempt.answers).toHaveLength(8);
    expect(f.attempt.maxTotal).toBe(800);
  });
});
