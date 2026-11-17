import { requireAdmin } from "@/lib/server/admin";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { validateSettings } from "@/lib/server/validate";
import { invalidateSetsCache } from "@/lib/server/daily";

export const PUT = handle(async (req: Request) => {
  await requireAdmin();
  const store = getStore();
  const current = (await store.getContent()).settings;
  const { settings, errors } = validateSettings(await readJson(req));
  if (!settings) return fail(errors.join(" · "));
  // Der Starttag darf nachträglich nicht verschoben werden (Archiv bleibt stabil)
  await store.saveSettings({ ...settings, launchDate: current.launchDate });
  invalidateSetsCache();
  return json({ ok: true });
});
