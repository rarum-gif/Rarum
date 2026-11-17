import type { Answer, Question, ReviewStatus, SourceRef, TierId, WrongAnswer } from "@/lib/types";

// Kompaktes Autorenformat für Seed-Inhalte. Wird beim Laden in vollständige
// Question-Objekte umgewandelt (identisch zum JSON-Import/Export-Format).

const TIER: Record<string, TierId> = { K: "known", F: "familiar", U: "unusual", R: "rare", V: "very_rare", L: "legendary" };

/** [Hauptantwort, Stufe K|F|U|R|V|L, Erklärung, Aliases?] */
export type A = [string, keyof typeof TIER | string, string, string[]?];
/** [Falschantwort, Erklärung, Aliases?] */
export type W = [string, string, string[]?];

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Direkter Link auf einen deutschsprachigen Wikipedia-Artikel */
export const wiki = (title: string, label?: string): SourceRef => ({
  label: label ?? `Wikipedia: ${title.replace(/_/g, " ")}`,
  url: `https://de.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
});

/** Wikipedia-Suche – ehrlicher Nachschlage-Link, wenn kein einzelner Artikel passt */
export const wsearch = (query: string): SourceRef => ({
  label: `Wikipedia-Suche: ${query}`,
  url: `https://de.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`,
});

const SEED_DATE = "2026-11-01T00:00:00.000Z";

export interface QDef {
  id: string;
  prompt: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  sources: SourceRef[];
  answers: A[];
  wrong?: W[];
  status?: ReviewStatus;
  notes?: string;
}

export function defineQuestions(packId: string, defs: QDef[]): Question[] {
  return defs.map((d) => {
    const id = `${packId}-${d.id}`;
    const answers: Answer[] = d.answers.map(([text, tier, explanation, aliases]) => {
      const t = TIER[tier];
      if (!t) throw new Error(`Ungültige Stufe ${tier} in ${id}`);
      return { id: `${id}:${slug(text)}`, text, aliases: aliases ?? [], tier: t, explanation, source: null, status: "verified" };
    });
    const wrongAnswers: WrongAnswer[] = (d.wrong ?? []).map(([text, explanation, aliases]) => ({ text, explanation, aliases: aliases ?? [] }));
    return {
      id,
      packId,
      prompt: d.prompt,
      topic: d.topic,
      difficulty: d.difficulty,
      timeLimitSeconds: null,
      status: d.status ?? "verified",
      sources: d.sources,
      notes: d.notes ?? "Seed-Inhalt: redaktionell zusammengestellt, Seltenheit redaktionell eingestuft.",
      answers,
      wrongAnswers,
      createdAt: SEED_DATE,
      updatedAt: SEED_DATE,
    };
  });
}
