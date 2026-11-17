import type { APIRequestContext, Page } from "@playwright/test";

/** Holt die Antwortliste über den geschützten Admin-Export (nur für Tests). */
export async function answerKey(request: APIRequestContext) {
  await request.post("/api/admin/login", { data: { password: "e2e-secret" } });
  const res = await request.get("/api/admin/export?format=json");
  const data = (await res.json()) as { questions: { prompt: string; answers: { text: string; aliases: string[]; tier: string }[] }[] };
  return new Map(data.questions.map((q) => [q.prompt, q.answers]));
}

export async function answerCurrent(page: Page, key: Map<string, { text: string; aliases: string[]; tier: string }[]>, pick: "rare" | "known" | "alias" | "empty" | string = "known") {
  const prompt = (await page.locator("form h2").innerText()).trim();
  const answers = key.get(prompt) ?? [];
  let value = "";
  if (pick === "known") value = answers.find((a) => a.tier === "known")?.text ?? answers[0].text;
  else if (pick === "rare") value = answers.find((a) => ["legendary", "very_rare"].includes(a.tier))?.text ?? answers[answers.length - 1].text;
  else if (pick === "alias") value = answers.find((a) => a.aliases.length)?.aliases[0] ?? answers[0].text.toUpperCase();
  else if (pick === "empty") value = "";
  else value = pick;
  await page.getByLabel("Deine Antwort").fill(value);
  await page.getByLabel("Deine Antwort").press("Enter");
  return { prompt, value };
}
