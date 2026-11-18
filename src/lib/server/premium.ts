import "server-only";
import type { SessionUser } from "./supabase";
import { sign, verify } from "./tokens";
import { MONETIZATION } from "@/lib/monetization";

/**
 * Premium-Berechtigung
 * --------------------
 * Premium ist rein kosmetisch bzw. Komfort (keine Spielvorteile). Bis ein
 * Zahlungsanbieter angebunden ist, wird Premium über Codes freigeschaltet
 * (Umgebungsvariable PREMIUM_CODES, z. B. "BETA2026:365,PRESSE:30").
 * Konten speichern das Ablaufdatum in der Datenbank; Gäste erhalten ein
 * signiertes Token, das nur der Server ausstellen kann.
 */

export function premiumCodes(): Map<string, number> {
  const out = new Map<string, number>();
  for (const part of (process.env.PREMIUM_CODES ?? "").split(",")) {
    const [code, days] = part.split(":").map((s) => s.trim());
    const n = Number(days);
    if (code && Number.isInteger(n) && n > 0 && n <= 3660) out.set(code.toUpperCase(), n);
  }
  return out;
}

export function guestPremiumToken(until: string) {
  return sign({ until }, "premium");
}

export function premiumUntil(user: SessionUser | null, guestToken?: string | null): string | null {
  if (user) return user.premiumUntil;
  const p = verify<{ until: string }>(guestToken, "premium");
  return p?.until ?? null;
}

export function isPremium(user: SessionUser | null, guestToken?: string | null, now = new Date()): boolean {
  if (!MONETIZATION) return true; // alles kostenlos
  const until = premiumUntil(user, guestToken);
  return !!until && new Date(until).getTime() > now.getTime();
}

export function premiumHeader(req: Request) {
  return req.headers.get("x-nnaxos-premium");
}
