import type { Question } from "@/lib/types";
import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { validateQuestion } from "@/lib/server/validate";
import { csvToQuestions } from "@/lib/csv";

// Import von Fragen als JSON (Array oder {questions: [...]}) oder CSV.
// dryRun: nur prüfen, nichts speichern.
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const body = await readJson<{ format?: "json" | "csv"; data?: string; dryRun?: boolean }>(req);
  const store = getStore();
  const content = await store.getContent();
  let raw: unknown[] = [];
  const errors: string[] = [];
  if (body.format === "csv") {
    const parsed = csvToQuestions(body.data ?? "");
    raw = parsed.questions;
    errors.push(...parsed.errors);
  } else {
    try {
      const data = JSON.parse(body.data ?? "[]");
      raw = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
    } catch {
      return fail("Die JSON-Datei konnte nicht gelesen werden.");
    }
  }
  if (!raw.length && !errors.length) return fail("Keine Fragen gefunden.");
  const valid: Question[] = [];
  raw.forEach((item, i) => {
    const r = validateQuestion(item, content.packs.map((p) => p.id));
    if (r.question && !r.errors.length) valid.push(r.question);
    else errors.push(`Frage ${i + 1} (${(item as { id?: string })?.id ?? "ohne ID"}): ${r.errors.join(", ")}`);
  });
  if (body.dryRun) return json({ ok: true, valid: valid.length, errors });
  if (errors.length) return json({ ok: false, valid: valid.length, errors }, 422);
  const res = await store.importQuestions(valid);
  return json({ ok: true, ...res, errors: [] });
});
