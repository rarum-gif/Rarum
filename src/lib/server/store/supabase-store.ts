import "server-only";
import type { AnswerReport, ContentData, DailySet, GameSettings, LevelDef, Question, ReviewStatus, ThemePack, TierId } from "@/lib/types";
import { serviceClient } from "@/lib/server/supabase";
import type { ContentStore } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CACHE_MS = 30_000;

function packFromRow(r: any): ThemePack {
  return {
    id: r.id, name: r.name, short: r.short, tagline: r.tagline, description: r.description, topics: r.topics ?? [],
    accent: r.accent, accentSoft: r.accent_soft, ink: r.ink, order: r.sort_order, coverImage: r.cover_image,
  };
}

function questionFromRow(r: any): Question {
  return {
    id: r.id,
    packId: r.pack_id,
    prompt: r.prompt,
    topic: r.topic,
    difficulty: r.difficulty,
    timeLimitSeconds: r.time_limit_seconds,
    status: r.status as ReviewStatus,
    sources: r.sources ?? [],
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    answers: (r.accepted_answers ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((a: any) => ({
        id: a.id, text: a.text, tier: a.tier as TierId, pointsOverride: a.points_override, explanation: a.explanation,
        source: a.source, status: a.status, aliases: (a.answer_aliases ?? []).map((x: any) => x.alias),
      })),
    wrongAnswers: (r.rejected_answers ?? []).map((w: any) => ({ text: w.text, aliases: w.aliases ?? [], explanation: w.explanation })),
  };
}

function setFromRow(r: any, kind: "daily" | "pack"): DailySet {
  return {
    id: r.id, date: r.date, kind, packId: kind === "pack" ? r.pack_id : null, createdBy: r.created_by, publishedAt: r.published_at,
    items: (r.question_ids as string[]).map((questionId, i) => ({ questionId, repeat: !!r.repeat_flags[i] })),
  };
}

function setToRow(s: DailySet) {
  const base = {
    id: s.id, date: s.date, created_by: s.createdBy, published_at: s.publishedAt,
    question_ids: s.items.map((i) => i.questionId), repeat_flags: s.items.map((i) => i.repeat),
  };
  return s.kind === "pack" ? { ...base, pack_id: s.packId } : base;
}

function check<T>(res: { data: T; error: any }): T {
  if (res.error) throw new Error(res.error.message ?? String(res.error));
  return res.data;
}

/** Supabase-Implementierung des Content-Stores (Service-Role, nur serverseitig). */
export class SupabaseStore implements ContentStore {
  readonly kind = "supabase" as const;
  readonly persistent = true;
  private cache: { at: number; data: ContentData } | null = null;

  private invalidate() {
    this.cache = null;
  }

  async getContent(): Promise<ContentData> {
    if (this.cache && Date.now() - this.cache.at < CACHE_MS) return this.cache.data;
    const db = serviceClient();
    const [settingsRows, tierRows, packRows] = await Promise.all([
      db.from("app_settings").select("key,value").then(check),
      db.from("rarity_tiers").select("*").order("rank").then(check),
      db.from("theme_packs").select("*").order("sort_order").then(check),
    ]);
    const questions: Question[] = [];
    for (let from = 0; ; from += 500) {
      const rows = check(
        await db
          .from("questions")
          .select("*, accepted_answers(*, answer_aliases(alias)), rejected_answers(*)")
          .order("id")
          .range(from, from + 499),
      ) as any[];
      questions.push(...rows.map(questionFromRow));
      if (rows.length < 500) break;
    }
    const kv = Object.fromEntries((settingsRows as any[]).map((r) => [r.key, r.value]));
    const game = kv.game ?? {};
    const settings: GameSettings = {
      tiers: (tierRows as any[]).map((t) => ({ id: t.id, label: t.label, points: t.points, rank: t.rank })),
      levels: (kv.levels as LevelDef[]) ?? [],
      dailyQuestionCount: game.dailyQuestionCount ?? 7,
      packQuestionCount: game.packQuestionCount ?? 5,
      timeLimitSeconds: game.timeLimitSeconds ?? 25,
      launchDate: game.launchDate ?? "2026-11-14",
      timezone: game.timezone ?? "Europe/Zurich",
    };
    const data: ContentData = { settings, packs: (packRows as any[]).map(packFromRow), questions };
    this.cache = { at: Date.now(), data };
    return data;
  }

  async saveQuestion(q: Question) {
    check(await serviceClient().rpc("admin_save_question", { q }));
    this.invalidate();
  }

  async deleteQuestion(id: string) {
    check(await serviceClient().from("questions").delete().eq("id", id));
    this.invalidate();
  }

  async importQuestions(qs: Question[]) {
    const res = check(await serviceClient().rpc("admin_import_questions", { qs })) as any;
    this.invalidate();
    return { created: res?.created ?? 0, updated: res?.updated ?? 0 };
  }

  async saveSettings(s: GameSettings) {
    const db = serviceClient();
    check(await db.from("rarity_tiers").upsert(s.tiers.map((t) => ({ id: t.id, label: t.label, points: t.points, rank: t.rank }))));
    check(
      await db.from("app_settings").upsert([
        { key: "levels", value: s.levels, updated_at: new Date().toISOString() },
        {
          key: "game",
          value: { dailyQuestionCount: s.dailyQuestionCount, packQuestionCount: s.packQuestionCount, timeLimitSeconds: s.timeLimitSeconds, launchDate: s.launchDate, timezone: s.timezone },
          updated_at: new Date().toISOString(),
        },
      ]),
    );
    this.invalidate();
  }

  async savePack(p: ThemePack) {
    check(
      await serviceClient()
        .from("theme_packs")
        .update({ name: p.name, short: p.short, tagline: p.tagline, description: p.description, topics: p.topics, accent: p.accent, accent_soft: p.accentSoft, ink: p.ink, sort_order: p.order, cover_image: p.coverImage ?? null })
        .eq("id", p.id),
    );
    this.invalidate();
  }

  async listSets(): Promise<DailySet[]> {
    const db = serviceClient();
    const [d, p] = await Promise.all([
      db.from("daily_challenges").select("*").order("date").then(check),
      db.from("daily_pack_challenges").select("*").order("date").limit(20000).then(check),
    ]);
    return [...(d as any[]).map((r) => setFromRow(r, "daily")), ...(p as any[]).map((r) => setFromRow(r, "pack"))];
  }

  async insertSets(sets: DailySet[]) {
    if (!sets.length) return;
    const db = serviceClient();
    const daily = sets.filter((s) => s.kind === "daily").map(setToRow);
    const pack = sets.filter((s) => s.kind === "pack").map(setToRow);
    // ignoreDuplicates: ein bereits veröffentlichtes Set wird nie überschrieben
    if (daily.length) check(await db.from("daily_challenges").upsert(daily, { onConflict: "id", ignoreDuplicates: true }));
    if (pack.length) check(await db.from("daily_pack_challenges").upsert(pack, { onConflict: "id", ignoreDuplicates: true }));
  }

  async replacePlannedSet(set: DailySet) {
    const db = serviceClient();
    const table = set.kind === "daily" ? "daily_challenges" : "daily_pack_challenges";
    check(await db.from(table).delete().eq("id", set.id));
    check(await db.from(table).insert(setToRow(set)));
  }

  async deleteSet(id: string) {
    const db = serviceClient();
    const table = id.startsWith("daily:") ? "daily_challenges" : "daily_pack_challenges";
    check(await db.from(table).delete().eq("id", id));
  }

  async addReport(r: AnswerReport) {
    check(
      await serviceClient().from("answer_reports").insert({ question_id: r.questionId, answer_text: r.answerText, note: r.note ?? null, status: r.status, reporter_id: (r as any).reporterId ?? null }),
    );
  }

  async listReports(): Promise<AnswerReport[]> {
    const rows = check(await serviceClient().from("answer_reports").select("*").order("created_at", { ascending: false }).limit(500)) as any[];
    return rows.map((r) => ({ id: r.id, questionId: r.question_id, answerText: r.answer_text, note: r.note ?? undefined, status: r.status, createdAt: r.created_at, resolution: r.resolution ?? undefined }));
  }

  async updateReport(id: string, patch: Partial<AnswerReport>) {
    check(await serviceClient().from("answer_reports").update({ status: patch.status, resolution: patch.resolution ?? null }).eq("id", id));
  }
}
