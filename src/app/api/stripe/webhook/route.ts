import type Stripe from "stripe";
import { fulfillCheckout, stripe } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe-Webhook: Signatur prüfen, dann bezahlte Checkout-Sessions freischalten.
 * Im Stripe-Dashboard anlegen mit den Ereignissen
 * checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook nicht konfiguriert", { status: 400 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Ungültige Signatur", { status: 400 });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckout(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        console.warn("[nnaxos] Zahlung fehlgeschlagen", event.data.object.id);
        break;
    }
  } catch (e) {
    console.error("[nnaxos] Webhook-Verarbeitung fehlgeschlagen", e instanceof Error ? e.message : e);
    // 500 → Stripe versucht es später erneut
    return new Response("Fehler", { status: 500 });
  }
  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}
