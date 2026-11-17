import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabasePublicConfig } from "@/lib/config";

let service: SupabaseClient | null = null;

/** Service-Role-Client: umgeht RLS, darf NUR serverseitig verwendet werden. */
export function serviceClient(): SupabaseClient {
  if (!service) {
    const cfg = supabasePublicConfig();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!cfg || !key) throw new Error("Supabase ist nicht konfiguriert");
    service = createClient(cfg.url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return service;
}

/** Client im Kontext des eingeloggten Nutzers (Cookies), respektiert RLS. */
export async function userClient(): Promise<SupabaseClient | null> {
  const cfg = supabasePublicConfig();
  if (!cfg) return null;
  const store = await cookies();
  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const c of list) store.set(c.name, c.value, c.options);
        } catch {
          // In Server Components nicht erlaubt – Middleware aktualisiert die Session.
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  email: string | null;
  username: string;
  avatar: string;
  role: "player" | "admin";
  inviteCode: string;
}

/** Liefert den eingeloggten Nutzer samt Profil oder null (Gast / Demo-Modus). */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;
  const client = await userClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: profile } = await serviceClient().from("profiles").select("username, avatar, role, invite_code").eq("id", user.id).maybeSingle();
  return {
    id: user.id,
    email: user.email ?? null,
    username: profile?.username ?? "spieler",
    avatar: profile?.avatar ?? "fern",
    role: (profile?.role as "player" | "admin") ?? "player",
    inviteCode: profile?.invite_code ?? "",
  };
}
