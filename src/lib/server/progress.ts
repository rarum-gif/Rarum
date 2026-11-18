import "server-only";
import { atlasPlace } from "@/content/atlas";

import type { AttemptAnswer, AttemptRecord, ContentData, PlayMode, ResultStatus, TierId } from "@/lib/types";
import { ACHIEVEMENTS, computeStats, earnedAchievements } from "@/lib/game/stats";
import { serviceClient } from "./supabase";

function atlasPrompt(id: string) {
  const p = id.startsWith("atlas:") ? atlasPlace(id.slice(6)) : null;
  return { prompt: p ? `Wo liegt ${p.name}?` : "", packId: p ? "geografie" : "" };
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// Serverseitige Speicherung der Spielstände eingeloggter Nutzer (Supabase).

export interface AttemptRow {
  id: string;
  user_id: string;
  mode: PlayMode;
  official: boolean;
  set_id: string | null;
  set_date: string | null;
  pack_id: string | null;
  question_ids: string[];
  total: number;
  max_total: number;
  started_at: string;
  finished_at: string | null;
}

export async function findOfficialAttempt(userId: string, setId: string): Promise<AttemptRow | null> {
  const { data, error } = await serviceClient().from("challenge_attempts").select("*").eq("user_id", userId).eq("set_id", setId).eq("official", true).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as AttemptRow) ?? null;
}

export async function createAttempt(row: Omit<AttemptRow, "id" | "started_at" | "finished_at" | "total">): Promise<AttemptRow> {
  const db = serviceClient();
  const { data, error } = await db.from("challenge_attempts").insert({ ...row, total: 0 }).select("*").single();
  if (error) {
    // Paralleler Start derselben offiziellen Wertung -> vorhandenen Versuch verwenden
    if (row.official && row.set_id && (error as any).code === "23505") {
      const existing = await findOfficialAttempt(row.user_id, row.set_id);
      if (existing) return existing;
    }
    throw new Error(error.message);
  }
  return data as AttemptRow;
}

export async function appendQuestion(attemptId: string, questionIds: string[], maxTotal: number) {
  const { error } = await serviceClient().from("challenge_attempts").update({ question_ids: questionIds, max_total: maxTotal }).eq("id", attemptId).is("finished_at", null);
  if (error) throw new Error(error.message);
}

/** Markiert den Start einer Frage. Ein erneuter Aufruf ändert die Startzeit NICHT. */
export async function markStarted(attemptId: string, position: number, questionId: string): Promise<{ startedAt: string; answered: boolean }> {
  const db = serviceClient();
  await db.from("user_answers").upsert({ attempt_id: attemptId, position, question_id: questionId }, { onConflict: "attempt_id,position", ignoreDuplicates: true });
  const { data, error } = await db.from("user_answers").select("started_at, answered_at").eq("attempt_id", attemptId).eq("position", position).single();
  if (error) throw new Error(error.message);
  return { startedAt: data.started_at, answered: !!data.answered_at };
}

export async function getAnswerRows(attemptId: string) {
  const { data, error } = await serviceClient().from("user_answers").select("*").eq("attempt_id", attemptId).order("position");
  if (error) throw new Error(error.message);
  return (data ?? []) as any[];
}

export async function saveAnswer(attemptId: string, position: number, r: { input: string; status: ResultStatus; answerId: string | null; answerText: string | null; tier: TierId | null; points: number }) {
  const { data, error } = await serviceClient()
    .from("user_answers")
    .update({ answered_at: new Date().toISOString(), input: r.input, status: r.status, answer_id: r.answerId, answer_text: r.answerText, tier: r.tier, points: r.points })
    .eq("attempt_id", attemptId)
    .eq("position", position)
    .is("answered_at", null)
    .select("position");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0; // false = war bereits beantwortet
}

export async function finishAttempt(attemptId: string, total: number, maxTotal: number) {
  const { error } = await serviceClient().from("challenge_attempts").update({ finished_at: new Date().toISOString(), total, max_total: maxTotal }).eq("id", attemptId).is("finished_at", null);
  if (error) throw new Error(error.message);
}

export async function listAttempts(userId: string, content: ContentData): Promise<AttemptRecord[]> {
  const { data, error } = await serviceClient()
    .from("challenge_attempts")
    .select("*, user_answers(*)")
    .eq("user_id", userId)
    .not("finished_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  const qmap = new Map(content.questions.map((q) => [q.id, q]));
  return (data as any[]).map((a) => ({
    id: a.id,
    mode: a.mode,
    official: a.official,
    setId: a.set_id,
    date: a.set_date,
    packId: a.pack_id,
    total: a.total,
    maxTotal: a.max_total,
    startedAt: a.started_at,
    finishedAt: a.finished_at,
    answers: (a.user_answers ?? [])
      .filter((u: any) => u.answered_at)
      .sort((x: any, y: any) => x.position - y.position)
      .map(
        (u: any): AttemptAnswer => ({
          questionId: u.question_id,
          ...(qmap.has(u.question_id) ? { prompt: qmap.get(u.question_id)!.prompt, packId: qmap.get(u.question_id)!.packId } : atlasPrompt(u.question_id)),
          input: u.input ?? "",
          status: u.status,
          answerText: u.answer_text,
          tier: u.tier,
          points: u.points,
        }),
      ),
  }));
}

/** Aktualisiert die Statistik-Zeile und vergebene Abzeichen nach einer Runde. */
export async function refreshStats(userId: string, content: ContentData, today: string) {
  const attempts = await listAttempts(userId, content);
  const stats = computeStats(attempts, content.packs, today);
  const db = serviceClient();
  await db.from("user_stats").upsert({
    user_id: userId,
    total_points: stats.totalPoints,
    official_count: stats.officialCount,
    daily_count: stats.dailyCount,
    current_streak: stats.streak.current,
    longest_streak: stats.streak.longest,
    best_daily: stats.bestDaily?.total ?? 0,
    rare_answers: stats.rareAnswers,
    last_daily_date: attempts.filter((a) => a.official && a.mode === "daily").map((a) => a.date).sort().pop() ?? null,
    updated_at: new Date().toISOString(),
  });
  const earned = earnedAchievements(stats, attempts);
  if (earned.length) {
    await db.from("user_achievements").upsert(earned.map((id) => ({ user_id: userId, achievement_id: id })), { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
  }
  return { stats, earned };
}

/** Übernimmt signierte lokale Ergebnisse (Gast) ins Konto. */
export async function importAttempts(userId: string, records: AttemptRecord[]) {
  const db = serviceClient();
  let imported = 0;
  let skipped = 0;
  for (const r of records) {
    if (r.official && r.setId && (await findOfficialAttempt(userId, r.setId))) {
      skipped++;
      continue;
    }
    const { data, error } = await db
      .from("challenge_attempts")
      .insert({ user_id: userId, mode: r.mode, official: r.official, set_id: r.setId, set_date: r.date, pack_id: r.packId, question_ids: r.answers.map((a) => a.questionId), total: r.total, max_total: r.maxTotal, started_at: r.startedAt, finished_at: r.finishedAt, source: "import" })
      .select("id")
      .single();
    if (error) {
      skipped++;
      continue;
    }
    await db.from("user_answers").insert(
      r.answers.map((a, i) => ({ attempt_id: data.id, position: i, question_id: a.questionId, started_at: r.startedAt, answered_at: r.finishedAt, input: a.input, status: a.status, answer_text: a.answerText, tier: a.tier, points: a.points })),
    );
    imported++;
  }
  return { imported, skipped };
}

export function achievementSeedRows() {
  return ACHIEVEMENTS.map((a) => ({ id: a.id, title: a.title, description: a.description, icon: a.icon, tier: a.tier }));
}

