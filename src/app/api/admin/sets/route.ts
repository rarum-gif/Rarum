import type { DailySet } from "@/lib/types";
import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { ensureSets, invalidateSetsCache, summarize, todayKey } from "@/lib/server/daily";
import { isEligible, setId } from "@/lib/game/schedule";
import { isValidDateKey } from "@/lib/time";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  const content = await getStore().getContent();
  const sets = await ensureSets(content);
  return json({ today: todayKey(content), sets: sets.map((s) => ({ ...summarize(content, s), items: s.items })).sort((a, b) => (a.date < b.date ? 1 : -1)) });
});

// Zukünftiges Set planen (überschreibt nur noch nicht veröffentlichte Sets)
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const store = getStore();
  const content = await store.getContent();
  const body = await readJson<{ date?: string; kind?: "daily" | "pack"; packId?: string | null; questionIds?: string[] }>(req);
  const today = todayKey(content);
  if (!isValidDateKey(body.date)) return fail("Ungültiges Datum.");
  if (body.date <= today) return fail("Veröffentlichte Tages-Sets (heute und früher) können nicht mehr verändert werden.", 409);
  const kind = body.kind === "pack" ? "pack" : "daily";
  if (kind === "pack" && !content.packs.some((p) => p.id === body.packId)) return fail("Unbekanntes Themen-Pack.");
  const ids = Array.isArray(body.questionIds) ? [...new Set(body.questionIds)] : [];
  if (!ids.length) return fail("Bitte wähle mindestens eine Frage.");
  for (const id of ids) {
    const q = content.questions.find((x) => x.id === id);
    if (!q) return fail(`Frage ${id} existiert nicht.`);
    if (!isEligible(q)) return fail(`Frage „${q.prompt}“ ist nicht geprüft und darf nicht in offiziellen Challenges erscheinen.`);
    if (kind === "pack" && q.packId !== body.packId) return fail(`Frage „${q.prompt}“ gehört nicht zu diesem Pack.`);
  }
  const sets = await ensureSets(content);
  const used = new Set(sets.filter((s) => s.date < body.date! && s.kind === kind && (kind === "daily" || s.packId === body.packId)).flatMap((s) => s.items.map((i) => i.questionId)));
  const set: DailySet = {
    id: setId(kind, body.date, kind === "pack" ? body.packId : null),
    date: body.date,
    kind,
    packId: kind === "pack" ? body.packId! : null,
    items: ids.map((questionId) => ({ questionId, repeat: used.has(questionId) })),
    createdBy: "admin",
    publishedAt: new Date().toISOString(),
  };
  await store.replacePlannedSet(set);
  invalidateSetsCache();
  return json({ ok: true, set: summarize(content, set) });
});

export const DELETE = handle(async (req: Request) => {
  await requireAdmin();
  const store = getStore();
  const content = await store.getContent();
  const body = await readJson<{ id?: string }>(req);
  const sets = await ensureSets(content);
  const s = sets.find((x) => x.id === body.id);
  if (!s) return fail("Set nicht gefunden.", 404);
  if (s.date <= todayKey(content)) return fail("Veröffentlichte Sets bleiben unverändert erhalten.", 409);
  await store.deleteSet(s.id);
  invalidateSetsCache();
  return json({ ok: true });
});
