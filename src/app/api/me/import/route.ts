import type { AttemptRecord } from "@/lib/types";
import { fail, handle, json, readJson } from "@/lib/server/http";
import { importAttempts, refreshStats } from "@/lib/server/progress";
import { verifyReceipt } from "@/lib/server/run";
import { todayKey } from "@/lib/server/daily";
import { getStore } from "@/lib/server/store";
import { getSessionUser } from "@/lib/server/supabase";

// Übernimmt lokal gespeicherte Gast-Ergebnisse ins Konto – nur mit gültiger Server-Signatur.
export const POST = handle(async (req: Request) => {
  const user = await getSessionUser();
  if (!user) return fail("Nicht angemeldet.", 401);
  const body = await readJson<{ attempts?: AttemptRecord[] }>(req);
  const list = Array.isArray(body.attempts) ? body.attempts.slice(0, 500) : [];
  const verified = list.map(verifyReceipt).filter((x): x is AttemptRecord => !!x);
  const result = await importAttempts(user.id, verified);
  const content = await getStore().getContent();
  await refreshStats(user.id, content, todayKey(content));
  return json({ ...result, rejected: list.length - verified.length });
});
