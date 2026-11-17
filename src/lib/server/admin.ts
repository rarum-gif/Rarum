import "server-only";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/config";
import { getSessionUser } from "./supabase";
import { sign, verify } from "./tokens";
import { RunError } from "./run";

export const ADMIN_COOKIE = "rarum_admin";
const TTL_MS = 12 * 60 * 60 * 1000;

/** Passwort für den Admin-Bereich im Demo-Modus. In Produktion zwingend per Umgebungsvariable. */
export function adminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 4) return pw;
  return process.env.NODE_ENV === "production" ? null : "admin";
}

export function usesDefaultAdminPassword() {
  return !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
}

export function adminCookieValue() {
  return sign({ exp: Date.now() + TTL_MS }, "admin");
}

export async function isAdmin(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const user = await getSessionUser();
    if (user?.role === "admin") return true;
  }
  const store = await cookies();
  const payload = verify<{ exp: number }>(store.get(ADMIN_COOKIE)?.value, "admin");
  return !!payload && payload.exp > Date.now() && (!isSupabaseConfigured() || !!process.env.ADMIN_PASSWORD);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new RunError("Kein Zugriff auf den Admin-Bereich.", 401);
}
