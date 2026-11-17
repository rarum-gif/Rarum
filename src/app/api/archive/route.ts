import { ensureSets, summarize, todayKey } from "@/lib/server/daily";
import { handle, json } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const content = await getStore().getContent();
  const sets = await ensureSets(content);
  const today = todayKey(content);
  const items = sets
    .filter((s) => s.date <= today && s.items.length > 0)
    .map((s) => summarize(content, s))
    .sort((a, b) => (a.date === b.date ? (a.kind === "daily" ? -1 : 1) : a.date < b.date ? 1 : -1));
  return json({ today, items });
});
