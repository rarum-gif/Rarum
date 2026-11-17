import "server-only";
import { z } from "zod";
import type { GameSettings, Question } from "@/lib/types";
import { TIER_IDS } from "@/lib/types";
import { findCollisions } from "@/lib/game/matching";

const status = z.enum(["draft", "review", "verified", "invalid"]);
const source = z.object({ label: z.string().trim().min(1).max(200), url: z.string().trim().url().max(500).optional().or(z.literal("").transform(() => undefined)) });

export const answerSchema = z.object({
  id: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(200),
  aliases: z.array(z.string().trim().min(1).max(200)).max(50).default([]),
  tier: z.enum(TIER_IDS),
  pointsOverride: z.number().int().min(0).max(1000).nullable().optional(),
  explanation: z.string().trim().max(500).default(""),
  source: source.nullable().optional(),
  status: status.default("verified"),
});

export const questionSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{2,120}$/, "ID: nur Kleinbuchstaben, Ziffern und Bindestriche"),
  packId: z.string().trim().min(1),
  prompt: z.string().trim().min(5).max(300),
  topic: z.string().trim().max(80).default(""),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  timeLimitSeconds: z.number().int().min(5).max(120).nullable().optional(),
  status,
  sources: z.array(source).max(10).default([]),
  notes: z.string().max(2000).optional(),
  answers: z.array(answerSchema).max(400),
  wrongAnswers: z.array(z.object({ text: z.string().trim().min(1).max(200), aliases: z.array(z.string().trim().min(1).max(200)).max(50).default([]), explanation: z.string().trim().max(500).default("") })).max(100).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export function validateQuestion(input: unknown, packIds: string[]): { question?: Question; errors: string[] } {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.issues.map((i) => `${i.path.join(".") || "Frage"}: ${i.message}`) };
  const q = parsed.data;
  const errors: string[] = [];
  if (!packIds.includes(q.packId)) errors.push(`Unbekanntes Themen-Pack "${q.packId}".`);
  const ids = new Set<string>();
  for (const a of q.answers) {
    if (ids.has(a.id)) errors.push(`Doppelte Antwort-ID ${a.id}.`);
    ids.add(a.id);
  }
  errors.push(...findCollisions(q as Question));
  if (q.status === "verified") {
    if (q.answers.filter((a) => a.status === "verified").length < 3) errors.push("Geprüfte Fragen brauchen mindestens 3 geprüfte Antworten.");
    if (!q.sources.length) errors.push("Geprüfte Fragen brauchen mindestens eine Quelle.");
  }
  const now = new Date().toISOString();
  return { question: { ...(q as Question), createdAt: q.createdAt ?? now, updatedAt: now }, errors };
}

export const settingsSchema = z.object({
  tiers: z.array(z.object({ id: z.enum(TIER_IDS), label: z.string().trim().min(1).max(40), points: z.number().int().min(0).max(1000), rank: z.number().int().min(1).max(6) })).length(6),
  levels: z.array(z.object({ level: z.number().int().min(1).max(50), name: z.string().trim().min(1).max(40), minPoints: z.number().int().min(0) })).min(1).max(30),
  dailyQuestionCount: z.number().int().min(1).max(20),
  packQuestionCount: z.number().int().min(1).max(20),
  timeLimitSeconds: z.number().int().min(5).max(120),
  launchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(1),
});

export function validateSettings(input: unknown): { settings?: GameSettings; errors: string[] } {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  const s = parsed.data;
  const errors: string[] = [];
  if (!s.levels.some((l) => l.minPoints === 0)) errors.push("Ein Level muss bei 0 Punkten beginnen.");
  try {
    new Intl.DateTimeFormat("de", { timeZone: s.timezone });
  } catch {
    errors.push("Unbekannte Zeitzone.");
  }
  return errors.length ? { errors } : { settings: s as GameSettings, errors };
}
