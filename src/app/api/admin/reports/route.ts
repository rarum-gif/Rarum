import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  const store = getStore();
  const content = await store.getContent();
  const reports = (await store.listReports()).map((r) => ({ ...r, prompt: content.questions.find((q) => q.id === r.questionId)?.prompt ?? "(gelöscht)" }));
  return json({ reports });
});

export const PATCH = handle(async (req: Request) => {
  await requireAdmin();
  const body = await readJson<{ id?: string; status?: "open" | "accepted" | "rejected"; resolution?: string }>(req);
  if (!body.id || !["open", "accepted", "rejected"].includes(body.status ?? "")) return fail("Ungültige Anfrage.");
  await getStore().updateReport(body.id, { status: body.status, resolution: body.resolution?.slice(0, 500) });
  return json({ ok: true });
});
