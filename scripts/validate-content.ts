// Prüft den Seed-Bestand: eindeutige IDs, keine kollidierenden Aliases,
// Antworten nicht gleichzeitig als Falschantwort, Mindestumfang pro Pack.
import { seedContent } from "../src/content";
import { findCollisions, normalize, compact } from "../src/lib/game/matching";
import { isEligible } from "../src/lib/game/schedule";

const content = seedContent();
const problems: string[] = [];
const ids = new Set<string>();
let answers = 0;
for (const q of content.questions) {
  if (ids.has(q.id)) problems.push(`Doppelte Frage-ID ${q.id}`);
  ids.add(q.id);
  const aids = new Set<string>();
  for (const a of q.answers) {
    if (aids.has(a.id)) problems.push(`${q.id}: doppelte Antwort-ID ${a.id}`);
    aids.add(a.id);
    answers++;
  }
  for (const c of findCollisions(q)) problems.push(`${q.id}: ${c}`);
  const forms = new Set(q.answers.flatMap((a) => [a.text, ...a.aliases]).map((f) => compact(normalize(f))));
  for (const w of q.wrongAnswers ?? []) {
    for (const f of [w.text, ...(w.aliases ?? [])]) if (forms.has(compact(normalize(f)))) problems.push(`${q.id}: "${f}" ist zugleich gültig und falsch`);
  }
  if (!content.packs.some((p) => p.id === q.packId)) problems.push(`${q.id}: unbekanntes Pack ${q.packId}`);
}
for (const p of content.packs) {
  const n = content.questions.filter((q) => q.packId === p.id && isEligible(q)).length;
  console.log(`${p.name.padEnd(28)} ${n} spielbare Fragen`);
  if (n < 5) problems.push(`Pack ${p.id} hat nur ${n} spielbare Fragen`);
}
console.log(`\n${content.questions.length} Fragen, ${answers} Antworten`);
if (problems.length) {
  console.error("\nProbleme:\n" + problems.map((p) => " - " + p).join("\n"));
  process.exit(1);
}
console.log("Inhalte OK");
