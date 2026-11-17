import { handle, json, readJson } from "@/lib/server/http";
import { submitAnswer } from "@/lib/server/run";
import { getSessionUser } from "@/lib/server/supabase";

export const POST = handle(async (req: Request) => {
  const body = await readJson<{ token: string; input: string }>(req);
  return json(await submitAnswer(body.token, body.input, await getSessionUser()));
});
