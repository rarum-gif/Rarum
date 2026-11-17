import "server-only";
import type { ContentData, DailySet, PublicQuestion, Question } from "@/lib/types";
import { computeMissingSets, isEligible, setId } from "@/lib/game/schedule";
import { timeLimitOf } from "@/lib/game/scoring";
import { dateKey, nextReset } from "@/lib/time";
import { getStore } from "./store";

let ensuring: Promise<DailySet[]> | null = null;
let ensuredFor: string | null = null;
let cachedSets: DailySet[] | null = null;

export function todayKey(content: ContentData, now = new Date()) {
  return dateKey(now, content.settings.timezone);
}

/**
 * Stellt sicher, dass alle Tages-Sets bis heute existieren (eingefroren),
 * und liefert alle Sets (inkl. geplanter zukünftiger).
 */
export async function ensureSets(content: ContentData, now = new Date()): Promise<DailySet[]> {
  const today = todayKey(content, now);
  if (ensuredFor === today && cachedSets) return cachedSets;
  if (!ensuring) {
    ensuring = (async () => {
      const store = getStore();
      const existing = await store.listSets();
      const missing = computeMissingSets(content, existing, today, now.toISOString());
      if (missing.length) await store.insertSets(missing);
      const all = missing.length ? await store.listSets() : existing;
      cachedSets = all;
      ensuredFor = today;
      return all;
    })().finally(() => {
      ensuring = null;
    });
  }
  return ensuring;
}

export function invalidateSetsCache() {
  ensuredFor = null;
  cachedSets = null;
}

export function toPublicQuestion(content: ContentData, q: Question, repeat = false): PublicQuestion {
  return { id: q.id, packId: q.packId, prompt: q.prompt, topic: q.topic, difficulty: q.difficulty, timeLimitSeconds: timeLimitOf(content.settings, q), repeat };
}

export interface SetSummary {
  id: string;
  date: string;
  kind: "daily" | "pack";
  packId: string | null;
  count: number;
  repeats: number;
  difficulty: number;
  createdBy: "auto" | "admin";
}

export function summarize(content: ContentData, s: DailySet): SetSummary {
  const qs = s.items.map((i) => content.questions.find((q) => q.id === i.questionId)).filter(Boolean) as Question[];
  const avg = qs.length ? qs.reduce((a, q) => a + q.difficulty, 0) / qs.length : 0;
  return { id: s.id, date: s.date, kind: s.kind, packId: s.packId, count: s.items.length, repeats: s.items.filter((i) => i.repeat).length, difficulty: Math.round(avg * 10) / 10, createdBy: s.createdBy };
}

export async function getOverview(now = new Date()) {
  const content = await getStore().getContent();
  const sets = await ensureSets(content, now);
  const today = todayKey(content, now);
  const daily = sets.find((s) => s.id === setId("daily", today));
  const packs = content.packs.map((p) => {
    const s = sets.find((x) => x.id === setId("pack", today, p.id));
    return { packId: p.id, set: s ? summarize(content, s) : null, eligible: content.questions.filter((q) => q.packId === p.id && isEligible(q)).length };
  });
  return {
    today,
    serverNow: now.toISOString(),
    nextReset: nextReset(now, content.settings.timezone).toISOString(),
    timezone: content.settings.timezone,
    daily: daily ? summarize(content, daily) : null,
    packs,
  };
}
