import { handle, json, readJson } from "@/lib/server/http";
import { startRun, type StartInput } from "@/lib/server/run";
import { getSessionUser } from "@/lib/server/supabase";

export const POST = handle(async (req: Request) => {
  const body = await readJson<StartInput>(req);
  const user = await getSessionUser();
  const { token, meta } = await startRun({ mode: body.mode, packId: body.packId ?? null, date: body.date ?? null, practice: !!body.practice }, user);
  return json({ token, meta });
});
