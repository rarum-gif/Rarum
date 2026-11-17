// Erzeugt supabase/seed.sql aus den Seed-Inhalten (Packs, Stufen, Einstellungen, Fragen, Abzeichen).
import fs from "node:fs";
import path from "node:path";
import { seedContent } from "../src/content";
import { ACHIEVEMENTS } from "../src/lib/game/stats";

const q = (v: unknown) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;

export function seedSql(): string {
  const c = seedContent();
  const s = c.settings;
  const out: string[] = ["-- Automatisch erzeugt: npm run db:seed-sql", "begin;"];
  for (const t of s.tiers) out.push(`insert into public.rarity_tiers (id,label,points,rank) values (${q(t.id)},${q(t.label)},${t.points},${t.rank}) on conflict (id) do update set label=excluded.label, points=excluded.points;`);
  out.push(`insert into public.app_settings (key,value) values ('levels',${j(s.levels)}) on conflict (key) do update set value=excluded.value;`);
  out.push(`insert into public.app_settings (key,value) values ('game',${j({ dailyQuestionCount: s.dailyQuestionCount, packQuestionCount: s.packQuestionCount, timeLimitSeconds: s.timeLimitSeconds, launchDate: s.launchDate, timezone: s.timezone })}) on conflict (key) do update set value=excluded.value;`);
  for (const p of c.packs)
    out.push(`insert into public.theme_packs (id,name,short,tagline,description,topics,accent,accent_soft,ink,sort_order,cover_image) values (${q(p.id)},${q(p.name)},${q(p.short)},${q(p.tagline)},${q(p.description)},array[${p.topics.map(q).join(",")}]::text[],${q(p.accent)},${q(p.accentSoft)},${q(p.ink)},${p.order},${q(p.coverImage)}) on conflict (id) do update set name=excluded.name, tagline=excluded.tagline, description=excluded.description;`);
  for (const a of ACHIEVEMENTS) out.push(`insert into public.achievements (id,title,description,icon,tier) values (${q(a.id)},${q(a.title)},${q(a.description)},${q(a.icon)},${q(a.tier)}) on conflict (id) do update set title=excluded.title, description=excluded.description;`);
  for (const question of c.questions) out.push(`select public.admin_save_question(${j(question)});`);
  out.push("commit;");
  return out.join("\n") + "\n";
}

if (process.argv[1]?.endsWith("generate-seed-sql.ts")) {
  const file = path.join(process.cwd(), "supabase", "seed.sql");
  fs.writeFileSync(file, seedSql());
  console.log("geschrieben:", file);
}
