import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser } from "@/lib/server/supabase";
import { fulfillCheckout, paymentsEnabled, stripe } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

/**
 * Rückkehr von Stripe: Session direkt bei Stripe abfragen und freischalten,
 * falls der Webhook noch nicht angekommen ist (gleiche idempotente Funktion).
 */
export const POST = handle(async (req: Request) => {
  if (!paymentsEnabled()) return fail("Zahlungen sind noch nicht aktiviert.", 503);
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const { sessionId } = await readJson<{ sessionId?: string }>(req);
  if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return fail("Ungültige Zahlung.");
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  if ((session.client_reference_id ?? session.metadata?.user_id) !== user.id) return fail("Diese Zahlung gehört zu einem anderen Konto.", 403);
  const r = await fulfillCheckout(session);
  return json({ status: r });
});
