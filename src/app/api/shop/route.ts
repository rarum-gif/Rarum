import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser, serviceClient } from "@/lib/server/supabase";
import { listAttempts } from "@/lib/server/progress";
import { getStore } from "@/lib/server/store";
import { canBuy, computeEconomy, shopItem, type Purchase } from "@/lib/game/economy";

export const dynamic = "force-dynamic";

async function purchasesOf(userId: string): Promise<Purchase[]> {
  const { data, error } = await serviceClient().from("purchases").select("item_id, price, created_at").eq("user_id", userId).order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({ itemId: r.item_id as string, price: r.price as number, at: r.created_at as string }));
}

/** Eigene Käufe (nur mit Konto – Gäste speichern lokal). */
export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return json({ purchases: [] });
  return json({ purchases: await purchasesOf(user.id) });
});

/** Kauf: Der Server rechnet den Kontostand selbst aus den gespeicherten Runden nach. */
export const POST = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Bitte zuerst ein Spielerkonto erstellen.", 401);
  const { itemId } = await readJson<{ itemId?: string }>(req);
  const item = shopItem(String(itemId ?? ""));
  if (!item) return fail("Unbekannter Artikel.");
  const content = await getStore().getContent();
  const economy = computeEconomy(await listAttempts(user.id, content));
  const current = await purchasesOf(user.id);
  const err = canBuy(item, economy, current);
  if (err) return fail(err, 409);
  const { error } = await serviceClient().from("purchases").insert({ user_id: user.id, item_id: item.id, price: item.price });
  if (error) return fail("Kauf fehlgeschlagen.", 500);
  return json({ purchases: await purchasesOf(user.id) });
});
