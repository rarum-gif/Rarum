import { handle, json } from "@/lib/server/http";
import { userClient } from "@/lib/server/supabase";

export const POST = handle(async () => {
  const client = await userClient();
  await client?.auth.signOut();
  return json({ ok: true });
});
