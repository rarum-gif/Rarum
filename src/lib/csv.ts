import type { Question, ReviewStatus, SourceRef, TierId } from "@/lib/types";
import { TIER_IDS } from "@/lib/types";

// CSV-Import/Export: eine Zeile pro Antwort. Fragen werden über question_id gruppiert.
// tier = "wrong" kennzeichnet eine bekannte Falschantwort.

export const CSV_COLUMNS = [
  "question_id", "pack_id", "prompt", "topic", "difficulty", "status", "time_limit", "sources", "notes",
  "answer_text", "aliases", "tier", "points_override", "explanation", "answer_status",
] as const;

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const sourcesToString = (s: SourceRef[]) => s.map((x) => (x.url ? `${x.label}|${x.url}` : x.label)).join(" ;; ");
const sourcesFromString = (s: string): SourceRef[] =>
  s.split(";;").map((x) => x.trim()).filter(Boolean).map((x) => {
    const [label, url] = x.split("|").map((y) => y.trim());
    return url ? { label, url } : { label };
  });

export function questionsToCsv(questions: Question[]): string {
  const rows: string[] = [CSV_COLUMNS.join(",")];
  for (const q of questions) {
    const base = [q.id, q.packId, q.prompt, q.topic, q.difficulty, q.status, q.timeLimitSeconds ?? "", sourcesToString(q.sources), q.notes ?? ""];
    for (const a of q.answers) rows.push([...base, a.text, a.aliases.join(" | "), a.tier, a.pointsOverride ?? "", a.explanation, a.status].map(esc).join(","));
    for (const w of q.wrongAnswers ?? []) rows.push([...base, w.text, (w.aliases ?? []).join(" | "), "wrong", "", w.explanation, ""].map(esc).join(","));
    if (!q.answers.length && !(q.wrongAnswers ?? []).length) rows.push([...base, "", "", "", "", "", ""].map(esc).join(","));
  }
  return rows.join("\n");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function csvToQuestions(text: string): { questions: Question[]; errors: string[] } {
  const rows = parseCsv(text);
  const errors: string[] = [];
  if (!rows.length) return { questions: [], errors: ["Die Datei ist leer."] };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  for (const k of ["question_id", "pack_id", "prompt", "answer_text", "tier"]) if (idx(k) < 0) errors.push(`Spalte "${k}" fehlt.`);
  if (errors.length) return { questions: [], errors };
  const get = (r: string[], k: string) => (idx(k) >= 0 ? (r[idx(k)] ?? "").trim() : "");
  const map = new Map<string, Question>();
  const now = new Date().toISOString();
  rows.slice(1).forEach((r, n) => {
    const id = get(r, "question_id");
    if (!id) return errors.push(`Zeile ${n + 2}: question_id fehlt.`);
    let q = map.get(id);
    if (!q) {
      const diff = Number(get(r, "difficulty")) || 2;
      q = {
        id, packId: get(r, "pack_id"), prompt: get(r, "prompt"), topic: get(r, "topic"),
        difficulty: (Math.min(3, Math.max(1, diff)) as 1 | 2 | 3),
        status: ((get(r, "status") || "draft") as ReviewStatus),
        timeLimitSeconds: Number(get(r, "time_limit")) || null,
        sources: sourcesFromString(get(r, "sources")), notes: get(r, "notes") || undefined,
        answers: [], wrongAnswers: [], createdAt: now, updatedAt: now,
      };
      map.set(id, q);
    }
    const text = get(r, "answer_text");
    if (!text) return;
    const tier = get(r, "tier");
    const aliases = get(r, "aliases").split("|").map((x) => x.trim()).filter(Boolean);
    if (tier === "wrong") {
      q.wrongAnswers!.push({ text, aliases, explanation: get(r, "explanation") });
    } else if ((TIER_IDS as readonly string[]).includes(tier)) {
      const po = get(r, "points_override");
      q.answers.push({
        id: `${id}:${slugify(text)}`, text, aliases, tier: tier as TierId, pointsOverride: po ? Number(po) : null,
        explanation: get(r, "explanation"), source: null, status: ((get(r, "answer_status") || "verified") as ReviewStatus),
      });
    } else errors.push(`Zeile ${n + 2}: unbekannte Seltenheitsstufe "${tier}".`);
  });
  return { questions: [...map.values()], errors };
}
