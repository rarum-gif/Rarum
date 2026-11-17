import { isSupabaseConfigured } from "@/lib/config";
import { handle, json } from "@/lib/server/http";
import { getSessionUser } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await getSessionUser();
  return json({
    accountsEnabled: isSupabaseConfigured(),
    user: user ? { username: user.username, avatar: user.avatar, role: user.role, inviteCode: user.inviteCode, email: user.email?.endsWith(".invalid") ? null : user.email } : null,
  });
});
