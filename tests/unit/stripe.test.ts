import { beforeEach, describe, expect, it, vi } from "vitest";

// Datenbank-Attrappe: merkt sich Zahlungen und Profil-Updates
const db = { payments: new Map<string, unknown>(), profiles: new Map<string, string>() };
vi.mock("@/lib/server/supabase", () => ({
  serviceClient: () => ({
    from: (table: string) => ({
      insert: async (row: { session_id: string }) => {
        if (table !== "premium_payments") return { error: null };
        if (db.payments.has(row.session_id)) return { error: { code: "23505" } };
        db.payments.set(row.session_id, row);
        return { error: null };
      },
      update: (patch: { premium_until: string }) => ({
        eq: async (_c: string, id: string) => {
          db.profiles.set(id, patch.premium_until);
          return { error: null };
        },
      }),
    }),
  }),
}));

process.env.STRIPE_SECRET_KEY = "sk_test_dummy_for_unit_tests";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

const session = (over: Record<string, unknown> = {}) => ({
  id: "cs_test_abcdefghijkl",
  object: "checkout.session",
  payment_status: "paid",
  client_reference_id: "user-1",
  metadata: { user_id: "user-1", product: "premium_lifetime" },
  amount_total: 100,
  currency: "chf",
  payment_intent: "pi_123",
  ...over,
});

describe("Stripe: Premium-Einmalzahlung", () => {
  beforeEach(() => {
    db.payments.clear();
    db.profiles.clear();
  });

  it("schaltet bezahlte Sessions genau einmal frei", async () => {
    const { fulfillCheckout, LIFETIME_UNTIL } = await import("@/lib/server/stripe");
    expect(await fulfillCheckout(session() as never)).toBe("granted");
    expect(db.profiles.get("user-1")).toBe(LIFETIME_UNTIL);
    expect(await fulfillCheckout(session() as never)).toBe("already");
  });

  it("ignoriert unbezahlte, fremde oder manipulierte Sessions", async () => {
    const { fulfillCheckout } = await import("@/lib/server/stripe");
    expect(await fulfillCheckout(session({ payment_status: "unpaid" }) as never)).toBe("unpaid");
    expect(await fulfillCheckout(session({ amount_total: 1 }) as never)).toBe("invalid");
    expect(await fulfillCheckout(session({ metadata: { product: "anderes" } }) as never)).toBe("invalid");
    expect(db.profiles.size).toBe(0);
  });

  it("Webhook prüft die Signatur", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const { stripe } = await import("@/lib/server/stripe");
    const payload = JSON.stringify({ id: "evt_1", object: "event", type: "checkout.session.completed", data: { object: session() } });
    const bad = await POST(new Request("http://x/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": "t=1,v1=falsch" } }));
    expect(bad.status).toBe(400);
    expect(db.profiles.size).toBe(0);
    const header = stripe().webhooks.generateTestHeaderString({ payload, secret: "whsec_test_secret" });
    const ok = await POST(new Request("http://x/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": header } }));
    expect(ok.status).toBe(200);
    expect(db.profiles.get("user-1")).toMatch(/^2099/);
  });
});
