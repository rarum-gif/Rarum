import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser, serviceClient } from "@/lib/server/supabase";
import { purchasesOf } from "@/lib/server/purchases";
import { validateCharacter } from "@/lib/game/character";
import { ownedCount } from "@/lib/game/economy";

export const dynamic = "force-dynamic";

/** Spielfigur speichern – nur mit Gegenständen, die dem Spieler gehören. */
export const PUT = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const { character } = await readJson<{ character?: unknown }>(req);
  const purchases = await purchasesOf(user.id);
  const c = validateCharacter(character, (id) => ownedCount(purchases, id) > 0);
  if (typeof c === "string") return fail(c);
  const { error } = await serviceClient().from("profiles").update({ character: c }).eq("id", user.id);
  if (error) return fail("Figur konnte nicht gespeichert werden.", 500);
  return json({ character: c });
});
