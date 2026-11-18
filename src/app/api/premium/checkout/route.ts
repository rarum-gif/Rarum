import { fail, handle, json } from "@/lib/server/http";
import { getSessionUser } from "@/lib/server/supabase";
import { createPremiumCheckout, paymentsEnabled } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

/** Startet die Stripe-Bezahlseite für Premium (nur mit Spielerkonto). */
export const POST = handle(async (req: Request) => {
  if (!paymentsEnabled()) return fail("Zahlungen sind noch nicht aktiviert.", 503);
  const user = await getSessionUser();
  if (!user) return fail("Bitte melde dich zuerst an – Premium wird an dein Spielerkonto gebunden.", 401);
  if (user.premiumUntil && new Date(user.premiumUntil).getFullYear() >= 2099) return fail("Du hast Premium schon für immer.", 409);
  const origin = new URL(req.url).origin;
  const email = user.email && !user.email.endsWith(".invalid") ? user.email : null;
  const session = await createPremiumCheckout({ userId: user.id, email, origin });
  if (!session.url) return fail("Die Bezahlseite konnte nicht geöffnet werden.", 502);
  return json({ url: session.url });
});
