import type { Answer, Question, ReviewStatus, SourceRef, TierId, WrongAnswer } from "@/lib/types";
import { parseExtra } from "./extras/parse";
import { compact, normalize } from "@/lib/game/matching";

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

/**
 * Listen-Format für Fragen mit langen Antwortlisten (gleiches Zeilenformat wie die
 * Antwort-Erweiterungen). Zeilen mit „x “ am Anfang sind bekannte Falschantworten:
 *
 *   K Inception | Alias; Alias | Erklärung
 *   #auto            ← ab hier Stufe aus der Reihenfolge (ungewöhnlich … legendär)
 *   x From Dusk Till Dawn | | Drehbuch von Tarantino, Regie Robert Rodriguez.
 */
export interface LDef extends Omit<QDef, "answers" | "wrong"> {
  list: string;
}

export function defineListQuestions(packId: string, defs: LDef[]): Question[] {
  return defineQuestions(
    packId,
    defs.map(({ list, ...d }) => {
      const keep: string[] = [];
      const wrong: W[] = [];
      for (const raw of list.split("\n")) {
        const line = raw.trim();
        if (line.startsWith("x ")) {
          const [text, aliases = "", explanation = ""] = line.slice(2).split("|").map((s) => s.trim());
          wrong.push([text, explanation || "Das gehört nicht dazu.", aliases ? aliases.split(";").map((s) => s.trim()).filter(Boolean) : []]);
        } else if (line === "#auto") keep.push("#end", "#auto"); // explizite Stufen davor bleiben erhalten
        else keep.push(raw);
      }
      return { ...d, answers: dedupe(parseExtra(keep.join("\n"))), wrong };
    }),
  );
}

/** Doppelte Einträge (gleiche Schreibweise oder gleicher Alias) zusammenführen – die erste Stufe gewinnt. */
function dedupe(list: A[]): A[] {
  const owner = new Map<string, A>();
  const out: A[] = [];
  for (const entry of list) {
    const forms = [entry[0], ...(entry[3] ?? [])];
    const keys = forms.map((f) => compact(normalize(f)));
    const existing = keys.map((k) => owner.get(k)).find(Boolean);
    const target = existing ?? ([entry[0], entry[1], entry[2], []] as A);
    if (!existing) out.push(target);
    forms.forEach((f, i) => {
      if (!keys[i] || owner.has(keys[i])) return;
      owner.set(keys[i], target);
      if (f !== target[0]) target[3]!.push(f);
    });
  }
  return out;
}
