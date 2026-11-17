import type { Answer, Question, WrongAnswer } from "@/lib/types";

/**
 * Antworterkennung
 * ----------------
 * 1. Normalisierung (Gross-/Kleinschreibung, Akzente, Umlaute, ß, Satzzeichen,
 *    Leerzeichen, führende Artikel)
 * 2. Exakter Abgleich gegen Hauptantwort und hinterlegte Aliases
 * 3. Abgleich ohne Leerzeichen ("Rolling Stones" = "RollingStones")
 * 4. Vorsichtige Tippfehlerkorrektur (Damerau-Levenshtein) – nur bei sehr hoher
 *    Übereinstimmung UND nur, wenn der Treffer eindeutig ist.
 *
 * Es wird nie eine Antwort akzeptiert, die nicht in der Antwortliste steht.
 */

const LEADING_ARTICLES = ["der", "die", "das", "the", "la", "le", "les", "el", "los", "las", "il", "lo", "l", "den", "dem"];

const ROMAN: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10, xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15, xvi: 16 };

export function normalize(input: string): string {
  let s = input.normalize("NFKC").toLowerCase().trim();
  // deutsche Umlaut-Umschreibungen vereinheitlichen (ä -> a, ae -> a)
  s = s
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/œ/g, "oe")
    .replace(/ł/g, "l")
    .replace(/đ/g, "d")
    .replace(/ı/g, "i");
  // restliche Akzente entfernen (é -> e, ć -> c, ñ -> n …)
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  s = s.replace(/&/g, " und ").replace(/\+\+/g, " pp ").replace(/#/g, " sharp ").replace(/\+/g, " plus ");
  // Satzzeichen, Bindestriche, Apostrophe -> Leerzeichen
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  // Umschreibungen ae/oe/ue nur am Wortinneren nach Konsonant vereinheitlichen
  s = s.replace(/([bcdfghjklmnpqrstvwxz])(ae|oe|ue)/g, (_m, c: string, v: string) => c + v[0]);
  const parts = s.split(" ").filter(Boolean);
  while (parts.length > 1 && LEADING_ARTICLES.includes(parts[0])) parts.shift();
  // Römische Ordnungszahlen nach einem Namen vereinheitlichen ("Heinrich VIII" = "Heinrich 8")
  for (let i = 1; i < parts.length; i++) {
    const n = ROMAN[parts[i]];
    if (n) parts[i] = String(n);
  }
  return parts.join(" ");
}

export function compact(normalized: string): string {
  return normalized.replace(/ /g, "");
}

/** Damerau-Levenshtein (optimal string alignment) */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  const d: number[][] = Array.from({ length: al + 1 }, () => new Array<number>(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[al][bl];
}

/** Erlaubte Tippfehler je nach Länge – bewusst streng. */
export function allowedTypos(length: number): number {
  if (length < 5) return 0;
  if (length < 9) return 1;
  return 2;
}

interface Candidate {
  answer: Answer;
  form: string; // normalisierte Form
  compactForm: string;
  isAlias: boolean;
}

export type MatchKind = "exact" | "alias" | "fuzzy";

export interface MatchOutcome {
  kind: "answer";
  answer: Answer;
  matchKind: MatchKind;
}
export interface WrongOutcome {
  kind: "wrong";
  wrong: WrongAnswer;
}
export interface NoMatch {
  kind: "none";
}

function candidatesFor(answers: Answer[]): Candidate[] {
  const out: Candidate[] = [];
  for (const answer of answers) {
    const forms = [answer.text, ...answer.aliases];
    forms.forEach((f, i) => {
      const form = normalize(f);
      if (!form) return;
      out.push({ answer, form, compactForm: compact(form), isAlias: i > 0 });
    });
  }
  return out;
}

const TIER_ORDER = ["known", "familiar", "unusual", "rare", "very_rare", "legendary"];
const PERSON_PROMPT = /(person|präsident|kaiser|komponist|maler|architekt|erfinder|autor|schauspieler|sportler|entdecker|künstler|pharao|könig|monarch|ermittler|regie|weltmeister|gottheit|figur)/i;
/** Bei erfundenen Figuren zählt auch der Vorname allein ("Trevor", "Hermine"). */
const FICTION_PROMPT = /figur/i;
const NAME_FILLERS = new Set(["der", "die", "das", "von", "van", "de", "del", "da", "di", "du", "le", "la", "jr", "junior", "senior", "sohn", "grosse", "gross", "altere", "jungere", "heilige"]);

/** Kennzeichnende Namensteile einer Personen-Antwort (Nachname, ggf. Vorname bei Herrschern). */
/** Titel und Allerweltswörter taugen nicht als Kurzname ("Man" ist nicht "Bumblebee Man"). */
const GENERIC_TOKENS = new Set(["man", "mann", "guy", "king", "konig", "queen", "konigin", "mr", "mrs", "ms", "dr", "sir", "ser", "lady", "lord", "captain", "kapitan", "professor", "prof", "maester", "septa", "chief", "officer", "onkel", "uncle", "tante", "baby", "little", "big", "old", "alte", "alter", "junge", "boy", "girl", "kid", "the", "und", "and", "of", "in", "am", "im"]);

function nameTokens(form: string, firstToo = false): string[] {
  const all = form.split(" ").filter((p) => p && !/^\d+$/.test(p) && !NAME_FILLERS.has(p));
  if (all.length < 2) return [];
  const parts = all.filter((p) => !GENERIC_TOKENS.has(p));
  if (!parts.length) return [];
  const last = parts[parts.length - 1];
  return firstToo && parts[0].length >= 3 && parts[0] !== last ? [last, parts[0]] : [last];
}

/**
 * Nachnamen-Erkennung für Personenfragen: "Roosevelt" zählt als Franklin D. Roosevelt.
 * Teilen sich mehrere Antworten den Nachnamen, wird die bekannteste gewertet –
 * die Antwort ist in jedem Fall richtig.
 */
function matchSurname(cands: Candidate[], inputCompact: string, fuzzy: boolean, firstToo = false): Candidate | null {
  if (inputCompact.length < 3) return null;
  const tol = fuzzy ? allowedTypos(inputCompact.length) : 0;
  if (fuzzy && tol === 0) return null;
  let best: { cand: Candidate; dist: number } | null = null;
  for (const c of cands) {
    for (const t of nameTokens(c.form, firstToo)) {
      if (fuzzy && t[0] !== inputCompact[0]) continue;
      const dist = fuzzy ? editDistance(t, inputCompact) : t === inputCompact ? 0 : 99;
      if (dist > tol) continue;
      if (!best || dist < best.dist || (dist === best.dist && TIER_ORDER.indexOf(c.answer.tier) < TIER_ORDER.indexOf(best.cand.answer.tier))) best = { cand: c, dist };
    }
  }
  return best?.cand ?? null;
}

export function matchAnswer(question: Pick<Question, "answers" | "wrongAnswers"> & { prompt?: string }, rawInput: string): MatchOutcome | WrongOutcome | NoMatch {
  const input = normalize(rawInput);
  if (!input) return { kind: "none" };
  const inputCompact = compact(input);

  const usable = question.answers.filter((a) => a.status !== "invalid");
  const cands = candidatesFor(usable);

  // 1+2: exakt (normalisiert)
  const exact = cands.find((c) => c.form === input) ?? cands.find((c) => c.compactForm === inputCompact);
  if (exact) return { kind: "answer", answer: exact.answer, matchKind: exact.isAlias ? "alias" : "exact" };

  // bekannte Falschantworten exakt prüfen (bevor Tippfehler-Toleranz greift)
  for (const w of question.wrongAnswers ?? []) {
    const forms = [w.text, ...(w.aliases ?? [])].map((f) => compact(normalize(f)));
    if (forms.includes(inputCompact)) return { kind: "wrong", wrong: w };
  }

  const isPerson = !!question.prompt && PERSON_PROMPT.test(question.prompt) && !input.includes(" ");
  const firstToo = !!question.prompt && FICTION_PROMPT.test(question.prompt);
  if (isPerson) {
    const s = matchSurname(cands, inputCompact, false, firstToo);
    if (s) return { kind: "answer", answer: s.answer, matchKind: "alias" };
  }

  // 3: vorsichtige Tippfehlerkorrektur
  const tolerance = allowedTypos(inputCompact.length);
  if (tolerance === 0) return { kind: "none" };

  let best: { cand: Candidate; dist: number } | null = null;
  let ambiguous = false;
  for (const c of cands) {
    if (Math.abs(c.compactForm.length - inputCompact.length) > tolerance) continue;
    if (c.compactForm[0] !== inputCompact[0]) continue; // erster Buchstabe muss stimmen
    const dist = editDistance(c.compactForm, inputCompact);
    const limit = Math.min(tolerance, allowedTypos(c.compactForm.length));
    if (dist > limit) continue;
    if (!best || dist < best.dist) {
      ambiguous = false;
      best = { cand: c, dist };
    } else if (dist === best.dist && c.answer.id !== best.cand.answer.id) {
      ambiguous = true;
    }
  }
  if (!best || ambiguous) {
    const s = isPerson ? matchSurname(cands, inputCompact, true, firstToo) : null;
    return s ? { kind: "answer", answer: s.answer, matchKind: "fuzzy" } : { kind: "none" };
  }

  // Kein Fuzzy-Treffer, wenn die Eingabe genauso nah an einer bekannten Falschantwort liegt.
  for (const w of question.wrongAnswers ?? []) {
    for (const f of [w.text, ...(w.aliases ?? [])]) {
      if (editDistance(compact(normalize(f)), inputCompact) <= best.dist) return { kind: "none" };
    }
  }
  return { kind: "answer", answer: best.cand.answer, matchKind: "fuzzy" };
}

/** Prüft eine Frage auf kollidierende Formen (gleiche Normalform bei verschiedenen Antworten). */
export function findCollisions(question: Pick<Question, "answers">): string[] {
  const seen = new Map<string, string>();
  const problems: string[] = [];
  for (const c of candidatesFor(question.answers)) {
    const prev = seen.get(c.compactForm);
    if (prev && prev !== c.answer.id) problems.push(`"${c.form}" gehört zu mehreren Antworten`);
    seen.set(c.compactForm, c.answer.id);
  }
  return problems;
}
