import { NextResponse } from "next/server";
import { userClient } from "@/lib/server/supabase";

// Bestätigungslink aus der Registrierungs-/Login-E-Mail
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/profil?sync=1";
  if (code) {
    const client = await userClient();
    await client?.auth.exchangeCodeForSession(code);
  }
  const safe = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
  return NextResponse.redirect(new URL(safe, url.origin));
}
