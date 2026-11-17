import { handle, json, readJson } from "@/lib/server/http";
import { finishRun } from "@/lib/server/run";
import { getSessionUser } from "@/lib/server/supabase";

export const POST = handle(async (req: Request) => {
  const body = await readJson<{ token: string }>(req);
  return json(await finishRun(body.token, await getSessionUser()));
});
