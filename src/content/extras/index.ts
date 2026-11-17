import type { Answer, Question } from "@/lib/types";
import { compact, normalize } from "@/lib/game/matching";
import { slug } from "../dsl";
import { parseExtra } from "./parse";
import { extrasA } from "./a";
import { extrasB } from "./b";
import { extrasC } from "./c";
import { extrasD } from "./d";
import { extrasE } from "./e";
import { extrasF } from "./f";

const TIER = { K: "known", F: "familiar", U: "unusual", R: "rare", V: "very_rare", L: "legendary" } as const;

const SOURCES = [extrasA, extrasB, extrasC, extrasD, extrasE, extrasF];
/** Mehrere Dateien dürfen dieselbe Frage ergänzen – die Blöcke werden aneinandergehängt. */
export const EXTRAS: Record<string, string> = {};
for (const src of SOURCES) for (const [k, v] of Object.entries(src)) EXTRAS[k] = EXTRAS[k] ? EXTRAS[k] + "\n#end\n" + v : v;

/**
 * Ergänzt die Seed-Fragen um weitere gültige Antworten.
 * Kollidiert eine neue Antwort (oder einer ihrer Aliases) mit einer bestehenden,
 * werden die übrigen Schreibweisen als Aliases der bestehenden Antwort übernommen –
 * so entstehen keine Dubletten und die redaktionelle Stufe der Kernantwort bleibt.
 */
export function applyExtras(questions: Question[]): Question[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  for (const [qid, block] of Object.entries(EXTRAS)) {
    const q = byId.get(qid);
    if (!q) throw new Error(`Antwort-Erweiterung für unbekannte Frage: ${qid}`);
    const owner = new Map<string, Answer>();
    for (const a of q.answers) for (const f of [a.text, ...a.aliases]) {
      const c = compact(normalize(f));
      if (c && !owner.has(c)) owner.set(c, a);
    }
    const ids = new Set(q.answers.map((a) => a.id));
    for (const [text, tier, explanation, aliases = []] of parseExtra(block)) {
      const forms = [text, ...aliases];
      const keys = forms.map((f) => compact(normalize(f)));
      const existing = keys.map((k) => owner.get(k)).find(Boolean);
      if (existing) {
        forms.forEach((f, i) => {
          if (keys[i] && !owner.has(keys[i])) {
            existing.aliases.push(f);
            owner.set(keys[i], existing);
          }
        });
        continue;
      }
      let id = `${qid}:${slug(text)}`;
      for (let n = 2; ids.has(id); n++) id = `${qid}:${slug(text)}-${n}`;
      ids.add(id);
      const answer: Answer = {
        id,
        text,
        aliases: aliases.filter((f) => {
          const k = compact(normalize(f));
          return k && !owner.has(k);
        }),
        tier: TIER[tier as keyof typeof TIER],
        explanation,
        source: null,
        status: "verified",
      };
      q.answers.push(answer);
      for (const f of [answer.text, ...answer.aliases]) {
        const k = compact(normalize(f));
        if (k && !owner.has(k)) owner.set(k, answer);
      }
    }
  }
  return questions;
}
