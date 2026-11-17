import { requireAdmin } from "@/lib/server/admin";
import { handle } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { questionsToCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "json";
  const pack = url.searchParams.get("pack");
  const content = await getStore().getContent();
  const questions = content.questions.filter((q) => !pack || q.packId === pack);
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "csv") {
    return new Response("﻿" + questionsToCsv(questions), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="rarum-fragen-${stamp}.csv"` },
    });
  }
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), settings: content.settings, questions }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="rarum-fragen-${stamp}.json"` },
  });
});
