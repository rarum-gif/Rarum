import { handle, json, readJson } from "@/lib/server/http";
import { nextQuestion } from "@/lib/server/run";
import { getSessionUser } from "@/lib/server/supabase";

export const POST = handle(async (req: Request) => {
  const body = await readJson<{ token: string; peek?: boolean }>(req);
  return json(await nextQuestion(body.token, await getSessionUser(), new Date(), { peek: !!body.peek }));
});
