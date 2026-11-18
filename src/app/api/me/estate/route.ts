import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser, serviceClient } from "@/lib/server/supabase";
import { purchasesOf } from "@/lib/server/purchases";
import { validateEstate } from "@/lib/game/estate";

export const dynamic = "force-dynamic";

/** Grundstück speichern – Besitz, Grenzen und Überlappungen werden geprüft. */
export const PUT = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const { estate } = await readJson<{ estate?: unknown }>(req);
  const e = validateEstate(estate, await purchasesOf(user.id));
  if (typeof e === "string") return fail(e);
  const { error } = await serviceClient().from("profiles").update({ estate: e }).eq("id", user.id);
  if (error) return fail("Grundstück konnte nicht gespeichert werden.", 500);
  return json({ estate: e });
});
