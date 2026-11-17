import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { validateQuestion } from "@/lib/server/validate";
import { ensureSets } from "@/lib/server/daily";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  const store = getStore();
  const content = await store.getContent();
  const sets = await ensureSets(content);
  const usage: Record<string, string[]> = {};
  for (const s of sets) for (const it of s.items) (usage[it.questionId] ??= []).push(s.date);
  return json({ questions: content.questions, packs: content.packs, settings: content.settings, usage, storeKind: store.kind, persistent: store.persistent });
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const store = getStore();
  const content = await store.getContent();
  const body = await readJson(req);
  const { question, errors } = validateQuestion(body, content.packs.map((p) => p.id));
  if (!question || errors.length) return fail(errors.join(" · ") || "Ungültige Frage.");
  if (content.questions.some((q) => q.id === question.id)) return fail("Eine Frage mit dieser ID existiert bereits.", 409);
  await store.saveQuestion(question);
  return json({ ok: true, question });
});
