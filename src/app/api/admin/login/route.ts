import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, adminCookieValue, adminPassword } from "@/lib/server/admin";
import { fail, handle, readJson } from "@/lib/server/http";

let attempts: number[] = [];

export const POST = handle(async (req: Request) => {
  attempts = attempts.filter((t) => Date.now() - t < 60_000);
  if (attempts.length > 10) return fail("Zu viele Versuche. Bitte warte eine Minute.", 429);
  attempts.push(Date.now());
  const pw = adminPassword();
  if (!pw) return fail("Der Admin-Zugang ist nicht konfiguriert (ADMIN_PASSWORD fehlt).", 503);
  const body = await readJson<{ password?: string }>(req);
  const a = Buffer.from(String(body.password ?? ""));
  const b = Buffer.from(pw);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("Falsches Passwort.", 401);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminCookieValue(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 12 * 3600 });
  return res;
});
