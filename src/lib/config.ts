// Laufzeit-Konfiguration. Ohne Supabase-Zugangsdaten läuft NNAXOS im lokalen
// Demo-Modus: Inhalte aus data/store.json, Spielstände im Browser.

export function supabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseConfigured(): boolean {
  return !!(supabasePublicConfig() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const APP_NAME = "NNAXOS";
