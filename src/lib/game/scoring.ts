import type { Answer, AnswerResult, GameSettings, Question, RarityTier, TierId } from "@/lib/types";
import { matchAnswer } from "./matching";
import { fnv1a } from "./schedule";

/** Kulanzzeit für Netzwerklatenz beim automatischen Absenden nach Zeitablauf. */
export const GRACE_MS = 3000;

export function tierOf(settings: GameSettings, id: TierId): RarityTier {
  const t = settings.tiers.find((x) => x.id === id);
  if (!t) throw new Error(`Unbekannte Seltenheitsstufe ${id}`);
  return t;
}

export function pointsFor(settings: GameSettings, answer: Pick<Answer, "tier" | "pointsOverride">): number {
  if (typeof answer.pointsOverride === "number" && answer.pointsOverride >= 0) return answer.pointsOverride;
  return tierOf(settings, answer.tier).points;
}

export function maxPointsPerQuestion(settings: GameSettings): number {
  return Math.max(...settings.tiers.map((t) => t.points));
}

export function timeLimitOf(settings: GameSettings, q: Pick<Question, "timeLimitSeconds">): number {
  return q.timeLimitSeconds && q.timeLimitSeconds > 0 ? q.timeLimitSeconds : settings.timeLimitSeconds;
}

/** Ein paar andere gültige Antworten zeigen – eine bekannte und eine seltene. */
function examplesFor(q: Question, excludeId: string | null): { text: string; tier: TierId }[] {
  const ok = q.answers.filter((a) => a.status === "verified" && a.id !== excludeId);
  if (!ok.length) return [];
  const order = ["known", "familiar", "unusual", "rare", "very_rare", "legendary"];
  const sorted = ok.slice().sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier) || fnv1a(a.id) - fnv1a(b.id));
  const picks = [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
  const unique = picks.filter((a, i) => picks.findIndex((b) => b.id === a.id) === i);
  return unique.map((a) => ({ text: a.text, tier: a.tier }));
}

export interface EvaluateOptions {
  elapsedMs: number;
  /** In offiziellen Wertungen zählen nur geprüfte Antworten. */
  verifiedOnly?: boolean;
}

export function evaluateAnswer(settings: GameSettings, q: Question, input: string, opts: EvaluateOptions): AnswerResult {
  const base = { questionId: q.id, input: input.slice(0, 120), sources: q.sources };
  const limitMs = timeLimitOf(settings, q) * 1000;
  if (opts.elapsedMs > limitMs + GRACE_MS) {
    return { ...base, status: "timeout", answerId: null, answerText: null, tier: null, points: 0, explanation: "Die Zeit war leider abgelaufen.", examples: examplesFor(q, null) };
  }
  if (!input.trim()) {
    return { ...base, status: "empty", answerId: null, answerText: null, tier: null, points: 0, explanation: null, examples: examplesFor(q, null) };
  }
  const answers = opts.verifiedOnly === false ? q.answers : q.answers.filter((a) => a.status === "verified");
  const m = matchAnswer({ answers, wrongAnswers: q.wrongAnswers, prompt: q.prompt }, input);
  if (m.kind === "answer") {
    return {
      ...base,
      status: "accepted",
      answerId: m.answer.id,
      answerText: m.answer.text,
      tier: m.answer.tier,
      points: pointsFor(settings, m.answer),
      explanation: m.answer.explanation,
      matchKind: m.matchKind,
      examples: examplesFor(q, m.answer.id),
      sources: m.answer.source ? [m.answer.source, ...q.sources] : q.sources,
    };
  }
  if (m.kind === "wrong") {
    return { ...base, status: "known_wrong", answerId: null, answerText: m.wrong.text, tier: null, points: 0, explanation: m.wrong.explanation, examples: examplesFor(q, null) };
  }
  return { ...base, status: "unknown", answerId: null, answerText: null, tier: null, points: 0, explanation: null, examples: examplesFor(q, null) };
}
