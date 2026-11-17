import { fail, handle, json, readJson } from "@/lib/server/http";
import { getSessionUser, serviceClient } from "@/lib/server/supabase";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";

async function listFor(uid: string) {
  const db = serviceClient();
  const { data } = await db.from("friendships").select("user_id, friend_id, status, created_at").or(`user_id.eq.${uid},friend_id.eq.${uid}`);
  const rows = (data ?? []) as any[];
  const ids = [...new Set(rows.map((r) => (r.user_id === uid ? r.friend_id : r.user_id)))];
  const { data: profiles } = ids.length ? await db.from("profiles").select("id, username, avatar").in("id", ids) : { data: [] };
  const { data: stats } = ids.length ? await db.from("user_stats").select("user_id, total_points, current_streak, daily_count").in("user_id", ids) : { data: [] };
  const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const smap = new Map((stats ?? []).map((s: any) => [s.user_id, s]));
  return rows.map((r) => {
    const other = r.user_id === uid ? r.friend_id : r.user_id;
    const p: any = pmap.get(other) ?? {};
    const s: any = smap.get(other) ?? {};
    return {
      username: p.username ?? "?", avatar: p.avatar ?? "fern", status: r.status,
      direction: r.user_id === uid ? "outgoing" : "incoming",
      totalPoints: r.status === "accepted" ? s.total_points ?? 0 : null,
      streak: r.status === "accepted" ? s.current_streak ?? 0 : null,
      dailyCount: r.status === "accepted" ? s.daily_count ?? 0 : null,
    };
  });
}

export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  return json({ inviteCode: user.inviteCode, friends: await listFor(user.id) });
});

export const POST = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const body = await readJson<{ query?: string; accept?: string }>(req);
  const db = serviceClient();
  if (body.accept) {
    const { data: other } = await db.from("profiles").select("id").eq("username", body.accept).maybeSingle();
    if (!other) return fail("Anfrage nicht gefunden.", 404);
    await db.from("friendships").update({ status: "accepted" }).eq("user_id", other.id).eq("friend_id", user.id);
    return json({ ok: true, friends: await listFor(user.id) });
  }
  const q = (body.query ?? "").trim();
  if (q.length < 3) return fail("Bitte gib einen Benutzernamen oder Einladungscode ein.");
  const { data: target } = await db
    .from("profiles")
    .select("id, username")
    .or(`username.ilike.${q.replace(/[%,()]/g, "")},invite_code.eq.${q.toUpperCase().replace(/[^A-Z0-9]/g, "")}`)
    .maybeSingle();
  if (!target) return fail("Niemand mit diesem Namen oder Code gefunden.", 404);
  if (target.id === user.id) return fail("Du kannst dich nicht selbst hinzufügen.");
  const { data: reverse } = await db.from("friendships").select("status").eq("user_id", target.id).eq("friend_id", user.id).maybeSingle();
  if (reverse) {
    await db.from("friendships").update({ status: "accepted" }).eq("user_id", target.id).eq("friend_id", user.id);
  } else {
    const { error } = await db.from("friendships").insert({ user_id: user.id, friend_id: target.id });
    if (error && error.code !== "23505") return fail("Anfrage konnte nicht gesendet werden.");
  }
  return json({ ok: true, friends: await listFor(user.id) });
});

export const DELETE = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const body = await readJson<{ username?: string }>(req);
  const db = serviceClient();
  const { data: other } = await db.from("profiles").select("id").eq("username", body.username ?? "").maybeSingle();
  if (!other) return fail("Nicht gefunden.", 404);
  await db.from("friendships").delete().or(`and(user_id.eq.${user.id},friend_id.eq.${other.id}),and(user_id.eq.${other.id},friend_id.eq.${user.id})`);
  return json({ ok: true, friends: await listFor(user.id) });
});
