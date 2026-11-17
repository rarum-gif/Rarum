import { fail, handle, json } from "@/lib/server/http";
import { listAttempts } from "@/lib/server/progress";
import { getStore } from "@/lib/server/store";
import { getSessionUser } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const content = await getStore().getContent();
  return json({ attempts: await listAttempts(user.id, content) });
});
