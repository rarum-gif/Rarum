import { isSupabaseConfigured } from "@/lib/config";
import { fail, handle, json } from "@/lib/server/http";
import { userClient } from "@/lib/server/supabase";
import { getStore } from "@/lib/server/store";
import { todayKey } from "@/lib/server/daily";
import { season } from "@/lib/game/ranked";

export const dynamic = "force-dynamic";

/** Wochen-Rangliste des Ranked-Modus. Ohne Supabase: nur Saisondaten (Demo-Rivalen rendert der Client). */
export const GET = handle(async (req: Request) => {
  const content = await getStore().getContent();
  const s = season(todayKey(content), content.settings.timezone);
  if (!isSupabaseConfigured()) return json({ available: false, season: s, rows: [] });
  const scope = new URL(req.url).searchParams.get("scope") === "friends" ? "friends" : "global";
  const client = await userClient();
  const { data: auth } = await client!.auth.getUser();
  if (!auth.user) return json({ available: true, signedIn: false, season: s, rows: [] });
  const { data, error } = await client!.rpc("ranked_leaderboard", { season_start: s.start, scope, lim: 100 });
  if (error) return fail("Ranked-Rangliste konnte nicht geladen werden.", 500);
  return json({ available: true, signedIn: true, season: s, scope, rows: data ?? [] });
});
