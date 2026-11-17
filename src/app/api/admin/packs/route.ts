import type { ThemePack } from "@/lib/types";
import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";

export const PUT = handle(async (req: Request) => {
  await requireAdmin();
  const store = getStore();
  const body = await readJson<Partial<ThemePack> & { id?: string }>(req);
  const pack = (await store.getContent()).packs.find((p) => p.id === body.id);
  if (!pack) return fail("Pack nicht gefunden.", 404);
  const next: ThemePack = {
    ...pack,
    name: typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 60) : pack.name,
    tagline: typeof body.tagline === "string" ? body.tagline.trim().slice(0, 160) : pack.tagline,
    description: typeof body.description === "string" ? body.description.trim().slice(0, 600) : pack.description,
    coverImage: typeof body.coverImage === "string" && body.coverImage.trim() ? body.coverImage.trim().slice(0, 500) : null,
  };
  await store.savePack(next);
  return json({ ok: true, pack: next });
});
