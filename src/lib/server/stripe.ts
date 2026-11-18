import "server-only";
import Stripe from "stripe";
import { serviceClient } from "./supabase";

/**
 * Stripe – Einmalzahlung für Premium (1 CHF, für immer)
 * ----------------------------------------------------
 * • Bezahlt wird auf der von Stripe gehosteten Checkout-Seite (keine Kartendaten bei uns).
 * • Zahlungsarten wählt Stripe dynamisch (Karte, TWINT, Apple Pay … je nach Dashboard).
 * • Freigeschaltet wird über den signierten Webhook; die Bestätigungsseite ruft
 *   zusätzlich dieselbe idempotente Funktion auf, damit es sofort klappt.
 * Schlüssel nur als Umgebungsvariablen (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET),
 * empfohlen ist ein eingeschränkter Schlüssel (rk_…) mit Schreibrecht auf Checkout Sessions.
 */

export const PREMIUM_PRICE_RAPPEN = 100;
export const PREMIUM_CURRENCY = "chf";
export const LIFETIME_UNTIL = "2099-12-31T23:59:59.000Z";
const INTEGRATION_ID = "nnaxos-premium-lifetime-qkxrvmhd";

let client: Stripe | null = null;

export function paymentsEnabled() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe ist nicht konfiguriert");
  if (!client) client = new Stripe(key, { appInfo: { name: "NNAXOS" } });
  return client;
}

export async function createPremiumCheckout(opts: { userId: string; email: string | null; origin: string }) {
  return stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: PREMIUM_CURRENCY,
          unit_amount: PREMIUM_PRICE_RAPPEN,
          product_data: { name: "NNAXOS Premium", description: "Einmalig – gilt für immer. Rein kosmetisch, kein Spielvorteil." },
        },
      },
    ],
    client_reference_id: opts.userId,
    metadata: { user_id: opts.userId, product: "premium_lifetime" },
    customer_email: opts.email ?? undefined,
    success_url: `${opts.origin}/premium?kauf=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/premium?kauf=abbruch`,
    integration_identifier: INTEGRATION_ID,
  });
}

/**
 * Schaltet Premium für die Session frei – idempotent (pro Session nur einmal)
 * und nur, wenn die Zahlung wirklich eingegangen ist.
 */
export async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<"granted" | "already" | "unpaid" | "invalid"> {
  if (session.payment_status === "unpaid") return "unpaid";
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId || session.metadata?.product !== "premium_lifetime") return "invalid";
  if (session.amount_total !== PREMIUM_PRICE_RAPPEN || session.currency !== PREMIUM_CURRENCY) return "invalid";
  const db = serviceClient();
  const { error } = await db.from("premium_payments").insert({
    session_id: session.id,
    user_id: userId,
    amount: session.amount_total,
    currency: session.currency,
    payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
  });
  if (error) {
    if (error.code === "23505") return "already";
    throw error;
  }
  const { error: e2 } = await db.from("profiles").update({ premium_until: LIFETIME_UNTIL }).eq("id", userId);
  if (e2) throw e2;
  return "granted";
}
