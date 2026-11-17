import { isSupabaseConfigured } from "@/lib/config";
import { fail, handle, json } from "@/lib/server/http";
import { userClient } from "@/lib/server/supabase";
import { getStore } from "@/lib/server/store";
import { todayKey } from "@/lib/server/daily";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  if (!isSupabaseConfigured()) return json({ available: false, rows: [] });
  const url = new URL(req.url);
  const period = ["day", "week", "all"].includes(url.searchParams.get("period") ?? "") ? url.searchParams.get("period")! : "day";
  const scope = url.searchParams.get("scope") === "friends" ? "friends" : "global";
  const client = await userClient();
  const { data: auth } = await client!.auth.getUser();
  if (!auth.user) return json({ available: true, signedIn: false, rows: [] });
  const content = await getStore().getContent();
  const { data, error } = await client!.rpc("leaderboard", { period, ref_date: todayKey(content), scope, lim: 100 });
  if (error) return fail("Rangliste konnte nicht geladen werden.", 500);
  return json({ available: true, signedIn: true, period, scope, rows: data ?? [] });
});
