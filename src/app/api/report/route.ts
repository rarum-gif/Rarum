import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { getSessionUser } from "@/lib/server/supabase";
import { newId } from "@/lib/server/tokens";

const recent = new Map<string, number[]>();

export const POST = handle(async (req: Request) => {
  const body = await readJson<{ questionId?: string; answerText?: string; note?: string }>(req);
  const answerText = (body.answerText ?? "").trim().slice(0, 120);
  const note = (body.note ?? "").trim().slice(0, 500) || undefined;
  if (!body.questionId || !answerText) return fail("Bitte gib die Antwort an, die du melden möchtest.");
  const content = await getStore().getContent();
  if (!content.questions.some((q) => q.id === body.questionId)) return fail("Unbekannte Frage.", 404);
  // einfache Drosselung pro Client
  const key = req.headers.get("x-forwarded-for") ?? "local";
  const times = (recent.get(key) ?? []).filter((t) => Date.now() - t < 60_000);
  if (times.length >= 10) return fail("Zu viele Meldungen in kurzer Zeit. Bitte warte einen Moment.", 429);
  recent.set(key, [...times, Date.now()]);
  const user = await getSessionUser();
  await getStore().addReport({ id: newId("rep_"), questionId: body.questionId, answerText, note, status: "open", createdAt: new Date().toISOString(), ...(user ? { reporterId: user.id } : {}) } as never);
  return json({ ok: true });
});
