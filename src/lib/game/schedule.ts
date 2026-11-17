import type { ContentData, DailySet, DailySetItem, Question } from "@/lib/types";
import { addDays, daysBetween } from "@/lib/time";

/**
 * Daily-Content-System
 * --------------------
 * Tages-Sets werden serverseitig berechnet und beim ersten Abruf *eingefroren*
 * (gespeichert). Bereits veröffentlichte Sets ändern sich deshalb nie, auch
 * wenn später Fragen hinzukommen. Von Admins geplante Sets haben Vorrang.
 *
 * Auswahlregeln:
 * - Nur geprüfte Fragen (status "verified") mit mindestens 3 geprüften Antworten.
 * - Zuerst Fragen, die in dieser Set-Art noch nie gespielt wurden.
 * - Ist der Bestand erschöpft, werden die am längsten nicht gespielten Fragen
 *   wiederverwendet und ausdrücklich als Wiederholung markiert.
 * - Die Daily Challenge mischt Themen-Packs und vermeidet Fragen, die am selben
 *   Tag bereits in einem Pack-Set vorkommen.
 */

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function setId(kind: "daily" | "pack", date: string, packId?: string | null): string {
  return kind === "daily" ? `daily:${date}` : `pack:${packId}:${date}`;
}

export function isEligible(q: Question): boolean {
  return q.status === "verified" && q.answers.filter((a) => a.status === "verified").length >= 3;
}

interface Usage {
  lastUsed: Map<string, string>; // questionId -> date
}

function usageFrom(sets: DailySet[], before: string, predicate: (s: DailySet) => boolean): Usage {
  const lastUsed = new Map<string, string>();
  for (const s of sets) {
    if (s.date >= before || !predicate(s)) continue;
    for (const it of s.items) {
      const prev = lastUsed.get(it.questionId);
      if (!prev || prev < s.date) lastUsed.set(it.questionId, s.date);
    }
  }
  return { lastUsed };
}

function rankPool(pool: Question[], usage: Usage, date: string, salt: string) {
  const fresh = pool
    .filter((q) => !usage.lastUsed.has(q.id))
    .sort((a, b) => fnv1a(salt + date + a.id) - fnv1a(salt + date + b.id));
  const used = pool
    .filter((q) => usage.lastUsed.has(q.id))
    .sort((a, b) => {
      const da = usage.lastUsed.get(a.id)!;
      const db = usage.lastUsed.get(b.id)!;
      if (da !== db) return da < db ? -1 : 1;
      return fnv1a(salt + date + a.id) - fnv1a(salt + date + b.id);
    });
  return { fresh, used };
}

function sortByDifficulty(items: { q: Question; repeat: boolean }[], date: string): DailySetItem[] {
  return items
    .slice()
    .sort((a, b) => a.q.difficulty - b.q.difficulty || fnv1a(date + a.q.id) - fnv1a(date + b.q.id))
    .map((it) => ({ questionId: it.q.id, repeat: it.repeat }));
}

export function buildPackSet(content: ContentData, allSets: DailySet[], packId: string, date: string, now: string): DailySet {
  const n = content.settings.packQuestionCount;
  const pool = content.questions.filter((q) => q.packId === packId && isEligible(q));
  const usage = usageFrom(allSets, date, (s) => s.kind === "pack" && s.packId === packId);
  const { fresh, used } = rankPool(pool, usage, date, "pack:" + packId);
  const picked = [...fresh.slice(0, n).map((q) => ({ q, repeat: false }))];
  for (const q of used) {
    if (picked.length >= n) break;
    picked.push({ q, repeat: true });
  }
  return {
    id: setId("pack", date, packId),
    date,
    kind: "pack",
    packId,
    items: sortByDifficulty(picked, date),
    createdBy: "auto",
    publishedAt: now,
  };
}

export function buildDailySet(content: ContentData, allSets: DailySet[], date: string, now: string): DailySet {
  const n = content.settings.dailyQuestionCount;
  const sameDayPack = new Set(
    allSets.filter((s) => s.kind === "pack" && s.date === date).flatMap((s) => s.items.map((i) => i.questionId)),
  );
  const eligible = content.questions.filter(isEligible);
  // Pack-Überschneidungen am selben Tag vermeiden, solange genug Fragen übrig sind
  const withoutOverlap = eligible.filter((q) => !sameDayPack.has(q.id));
  const pool = withoutOverlap.length >= n ? withoutOverlap : eligible;
  const usage = usageFrom(allSets, date, (s) => s.kind === "daily");
  const { fresh, used } = rankPool(pool, usage, date, "daily");

  const packOrder = content.packs
    .map((p) => p.id)
    .sort((a, b) => fnv1a("order" + date + a) - fnv1a("order" + date + b));

  const picked: { q: Question; repeat: boolean }[] = [];
  const pickRoundRobin = (list: Question[], repeat: boolean) => {
    const byPack = new Map<string, Question[]>();
    for (const q of list) {
      if (!byPack.has(q.packId)) byPack.set(q.packId, []);
      byPack.get(q.packId)!.push(q);
    }
    let progress = true;
    while (picked.length < n && progress) {
      progress = false;
      for (const pid of packOrder) {
        if (picked.length >= n) break;
        const queue = byPack.get(pid);
        // pro Durchgang höchstens eine Frage je Pack -> maximale Themenvielfalt
        if (!queue?.length) continue;
        picked.push({ q: queue.shift()!, repeat });
        progress = true;
      }
    }
  };
  pickRoundRobin(fresh, false);
  if (picked.length < n) pickRoundRobin(used, true);

  return {
    id: setId("daily", date),
    date,
    kind: "daily",
    packId: null,
    items: sortByDifficulty(picked, date),
    createdBy: "auto",
    publishedAt: now,
  };
}

/**
 * Berechnet alle noch fehlenden Sets vom Starttag bis `target` (inklusive).
 * Gibt nur neue Sets zurück; bestehende werden nie verändert.
 */
export function computeMissingSets(content: ContentData, existing: DailySet[], target: string, now = new Date().toISOString()): DailySet[] {
  const launch = content.settings.launchDate;
  if (daysBetween(launch, target) < 0) return [];
  const all = existing.slice();
  const have = new Set(existing.map((s) => s.id));
  const created: DailySet[] = [];
  for (let d = launch; d <= target; d = addDays(d, 1)) {
    for (const pack of content.packs) {
      const id = setId("pack", d, pack.id);
      if (have.has(id)) continue;
      const s = buildPackSet(content, all, pack.id, d, now);
      all.push(s);
      created.push(s);
      have.add(id);
    }
    const did = setId("daily", d);
    if (!have.has(did)) {
      const s = buildDailySet(content, all, d, now);
      all.push(s);
      created.push(s);
      have.add(did);
    }
  }
  return created;
}
