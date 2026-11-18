import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser, serviceClient } from "@/lib/server/supabase";
import { guestPremiumToken, premiumCodes, premiumHeader, premiumUntil } from "@/lib/server/premium";

export const dynamic = "force-dynamic";

const tries = new Map<string, number[]>();
function rateLimited(key: string) {
  const now = Date.now();
  const list = (tries.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  tries.set(key, list);
  if (tries.size > 20_000) tries.clear();
  return list.length > 8;
}

/** Löst einen Premium-Code ein. */
export const POST = handle(async (req: Request) => {
  const { code } = await readJson<{ code?: string }>(req);
  const key = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (rateLimited(key)) return fail("Zu viele Versuche. Bitte warte ein paar Minuten.", 429);
  const days = premiumCodes().get(String(code ?? "").trim().toUpperCase());
  if (!days) return fail("Dieser Code ist ungültig.");
  const user = await getSessionUser();
  const base = (current: string | null) => Math.max(Date.now(), current ? new Date(current).getTime() : 0);
  if (user) {
    const db = serviceClient();
    const { error } = await db.from("premium_redemptions").insert({ user_id: user.id, code: String(code).trim().toUpperCase(), days });
    if (error) return fail(error.code === "23505" ? "Diesen Code hast du schon eingelöst." : "Code konnte nicht eingelöst werden.");
    const until = new Date(base(user.premiumUntil) + days * 86400_000).toISOString();
    const { error: e2 } = await db.from("profiles").update({ premium_until: until }).eq("id", user.id);
    if (e2) return fail("Code konnte nicht eingelöst werden.", 500);
    return json({ until });
  }
  const until = new Date(base(premiumUntil(null, premiumHeader(req))) + days * 86400_000).toISOString();
  return json({ until, token: guestPremiumToken(until) });
});
