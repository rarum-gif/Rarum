import { handle, json, readJson } from "@/lib/server/http";
import { startRun, type StartInput } from "@/lib/server/run";
import { getSessionUser } from "@/lib/server/supabase";
import { isPremium, premiumHeader } from "@/lib/server/premium";

export const POST = handle(async (req: Request) => {
  const body = await readJson<StartInput>(req);
  const user = await getSessionUser();
  const avoid = Array.isArray(body.avoid) ? body.avoid.filter((x): x is string => typeof x === "string" && x.length < 120).slice(-150) : [];
  const { token, meta } = await startRun(
    { mode: body.mode, packId: body.packId ?? null, date: body.date ?? null, practice: !!body.practice, difficulty: body.difficulty ?? null, avoid, premium: isPremium(user, premiumHeader(req)) },
    user,
  );
  return json({ token, meta });
});
