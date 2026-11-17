import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { validateQuestion } from "@/lib/server/validate";
import { ensureSets, todayKey } from "@/lib/server/daily";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const store = getStore();
  const content = await store.getContent();
  const existing = content.questions.find((q) => q.id === id);
  if (!existing) return fail("Frage nicht gefunden.", 404);
  const body = await readJson<Record<string, unknown>>(req);
  const { question, errors } = validateQuestion({ ...body, id, createdAt: existing.createdAt }, content.packs.map((p) => p.id));
  if (!question || errors.length) return fail(errors.join(" · ") || "Ungültige Frage.");
  await store.saveQuestion(question);
  return json({ ok: true, question });
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const store = getStore();
  const content = await store.getContent();
  const sets = await ensureSets(content);
  const today = todayKey(content);
  // Fragen aus bereits veröffentlichten Sets nicht löschen, sondern als ungültig markieren
  if (sets.some((s) => s.date <= today && s.items.some((i) => i.questionId === id))) {
    return fail("Diese Frage wurde bereits in einer veröffentlichten Challenge verwendet. Markiere sie stattdessen als „ungültig“, damit das Archiv intakt bleibt.", 409);
  }
  await store.deleteQuestion(id);
  return json({ ok: true });
});
