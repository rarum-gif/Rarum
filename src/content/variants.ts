import type { Answer, Question, WrongAnswer } from "@/lib/types";
import { compact, normalize } from "@/lib/game/matching";

/**
 * Schwierige Varianten
 * --------------------
 * Aus Fragen mit grossen Antwortlisten entstehen Varianten mit Anfangsbuchstaben,
 * z. B. „Nenne eine Stadt in Japan – Anfangsbuchstabe „K“.“ Gültig sind nur
 * Antworten der Grundfrage, die mit dem Buchstaben beginnen. Alle anderen
 * Antworten der Grundfrage werden freundlich als „falscher Buchstabe“ erklärt –
 * so gibt es nie ein verwirrendes „kennen wir nicht“ für eine eigentlich richtige Antwort.
 */

/** Kategorien, bei denen der Anfangsbuchstabe eindeutig ist (keine Personen, keine Werktitel mit Artikel). */
const ALLOW = /^(geografie-|tiere-pflanzen-|essen-trinken-|allgemeinwissen-(chemisches-element|knochen|sternbild|griechische-gottheit)|marken-wirtschaft-(automarke|modemarke|fluggesellschaft|sportartikel|schweizer-unternehmen|schweizer-uhrenmarke)|technik-(programmiersprache|betriebssystem|smartphone-hersteller|social-media|computer-komponente)|musik-(musikgenre|saiteninstrument|blasinstrument)|kunst-kultur-(kunstbewegung|kunstmuseum)|reisen-nationalpark|gaming-(pokemon-gen1|spielestudio))/;

const MIN_BASE = 40;
const MIN_LETTER = 6;

function rawInitial(text: string): string {
  // Anfangsbuchstabe so, wie man ihn liest: Akzente und Umlaute zählen als Grundbuchstabe
  const t = text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^[^A-Za-z0-9]+/, "");
  return t.charAt(0).toUpperCase();
}

export function buildLetterVariants(questions: Question[]): Question[] {
  const out: Question[] = [];
  for (const q of questions) {
    if (q.status !== "verified" || !ALLOW.test(q.id) || q.answers.length < MIN_BASE) continue;
    const byLetter = new Map<string, Answer[]>();
    for (const a of q.answers) {
      const l = rawInitial(a.text);
      if (!/[A-Z]/.test(l)) continue;
      byLetter.set(l, [...(byLetter.get(l) ?? []), a]);
    }
    const ranked = [...byLetter.entries()].filter(([, l]) => l.length >= MIN_LETTER).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    // nicht den häufigsten Buchstaben (zu leicht), sondern zwei aus dem Mittelfeld
    const picks = [ranked[1], ranked[3]].filter(Boolean) as [string, Answer[]][];
    for (const [letter, list] of picks) {
      const answers: Answer[] = list.map((a) => ({
        ...a,
        id: `${a.id}@${letter}`,
        aliases: a.aliases.filter((al) => rawInitial(al) === letter),
      }));
      const valid = new Set<string>();
      for (const a of answers) for (const f of [a.text, ...a.aliases]) valid.add(compact(normalize(f)));
      const wrongAnswers: WrongAnswer[] = [...(q.wrongAnswers ?? [])];
      for (const a of q.answers) {
        if (list.includes(a)) continue;
        const forms = [a.text, ...a.aliases].filter((f) => !valid.has(compact(normalize(f))));
        if (!forms.length) continue;
        wrongAnswers.push({ text: forms[0], aliases: forms.slice(1), explanation: `Richtig für die Grundfrage – aber das beginnt nicht mit „${letter}“.` });
      }
      out.push({
        ...q,
        id: `${q.id}-buchstabe-${letter.toLowerCase()}`,
        prompt: `${q.prompt.replace(/\.$/, "")} – Anfangsbuchstabe „${letter}“.`,
        difficulty: 3,
        answers,
        wrongAnswers,
        notes: `Automatisch erzeugte Variante von ${q.id} (Anfangsbuchstabe ${letter}).`,
      });
    }
  }
  return out;
}
