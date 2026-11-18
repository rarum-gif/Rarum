import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser, serviceClient } from "@/lib/server/supabase";
import { purchasesOf } from "@/lib/server/purchases";
import { isPremium } from "@/lib/server/premium";
import { listAttempts } from "@/lib/server/progress";
import { getStore } from "@/lib/server/store";
import { canBuy, computeEconomy, shopItem } from "@/lib/game/economy";

export const dynamic = "force-dynamic";

/** Eigene Käufe (nur mit Konto – Gäste speichern lokal). */
export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return json({ purchases: [] });
  return json({ purchases: await purchasesOf(user.id) });
});

// Käufe pro Konto nacheinander abarbeiten (verhindert Doppelausgaben bei gleichzeitigen Klicks)
const locks = new Map<string, Promise<unknown>>();
function serial<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  locks.set(key, next);
  void next.finally(() => { if (locks.get(key) === next) locks.delete(key); });
  return next;
}

/** Kauf: Der Server rechnet den Kontostand selbst aus den gespeicherten Runden nach. */
export const POST = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Dein Spielstand ist noch nicht online gespeichert. Bitte lade die Seite neu.", 401);
  const { itemId } = await readJson<{ itemId?: string }>(req);
  const item = shopItem(String(itemId ?? ""));
  if (!item) return fail("Unbekannter Artikel.");
  return serial(user.id, async () => {
  const content = await getStore().getContent();
  const economy = computeEconomy(await listAttempts(user.id, content));
  const current = await purchasesOf(user.id);
  const err = canBuy(item, economy, current, isPremium(user));
  if (err) return fail(err, 409);
  const { error } = await serviceClient().from("purchases").insert({ user_id: user.id, item_id: item.id, price: item.price });
  if (error) return fail("Kauf fehlgeschlagen.", 500);
  return json({ purchases: await purchasesOf(user.id) });
  });
});
