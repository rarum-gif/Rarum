import { fail, handle, json, readJson } from "@/lib/server/http";
import { serviceClient, getSessionUser } from "@/lib/server/supabase";
import { isValidAvatar } from "@/lib/avatars";

export const PATCH = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const body = await readJson<{ username?: string; avatar?: string }>(req);
  const patch: Record<string, string> = {};
  if (body.username !== undefined) {
    const u = body.username.trim();
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(u)) return fail("Benutzername: 3–24 Zeichen, nur Buchstaben, Ziffern, Punkt, Strich und Unterstrich.");
    patch.username = u;
  }
  if (body.avatar !== undefined) {
    if (!isValidAvatar(body.avatar)) return fail("Unbekannter Avatar.");
    patch.avatar = body.avatar;
  }
  const { error } = await serviceClient().from("profiles").update(patch).eq("id", user.id);
  if (error) return fail(error.code === "23505" ? "Dieser Benutzername ist bereits vergeben." : "Profil konnte nicht gespeichert werden.");
  return json({ ok: true });
});
