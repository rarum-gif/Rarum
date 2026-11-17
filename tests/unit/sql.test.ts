import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { seedSql } from "../../scripts/generate-seed-sql";

// Minimaler Nachbau der Supabase-Umgebung (auth-Schema, Rollen, auth.uid())
const SUPABASE_STUB = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated;
-- wie bei Supabase: Standardrechte für neue Tabellen
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

describe("Supabase-Migration (PostgreSQL via PGlite)", () => {
  it("lässt sich anwenden, seeden und schützt die Daten", async () => {
    const db = new PGlite({ extensions: { pgcrypto } });
    await db.exec(SUPABASE_STUB);
    const dir = path.join(__dirname, "../../supabase/migrations");
    for (const f of fs.readdirSync(dir).sort()) await db.exec(fs.readFileSync(path.join(dir, f), "utf8"));
    await db.exec(seedSql());

    const count = await db.query<{ n: number }>("select count(*)::int n from public.questions");
    expect(count.rows[0].n).toBeGreaterThan(100);
    const aliases = await db.query<{ n: number }>("select count(*)::int n from public.answer_aliases");
    expect(aliases.rows[0].n).toBeGreaterThan(1000);

    // Registrierung legt Profil + Statistik an
    const u1 = "11111111-1111-1111-1111-111111111111";
    const u2 = "22222222-2222-2222-2222-222222222222";
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${u1}', 'a@x.ch', '{"username":"anna"}'), ('${u2}', 'b@x.ch', '{"username":"anna"}')`);
    const profiles = await db.query<{ username: string }>("select username from public.profiles order by username");
    expect(profiles.rows.map((r) => r.username)).toEqual(["anna", "spieler_22222222"]);

    // Nur eine offizielle Wertung pro Set
    await db.exec(`insert into public.challenge_attempts (user_id, mode, official, set_id, set_date, total, finished_at) values ('${u1}','daily',true,'daily:2026-11-17','2026-11-17',300, now())`);
    await expect(db.exec(`insert into public.challenge_attempts (user_id, mode, official, set_id, set_date) values ('${u1}','daily',true,'daily:2026-11-17','2026-11-17')`)).rejects.toThrow(/duplicate key/);
    await db.exec(`insert into public.challenge_attempts (user_id, mode, official, set_id, set_date, total, finished_at) values ('${u1}','archive',false,'daily:2026-11-17','2026-11-17',650, now())`);
    await db.exec(`insert into public.challenge_attempts (user_id, mode, official, set_id, set_date, total, finished_at) values ('${u2}','daily',true,'daily:2026-11-17','2026-11-17',420, now())`);

    // RLS als eingeloggter Nutzer
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${u1}', false);`);
    expect((await db.query("select * from public.questions")).rows).toHaveLength(0); // Antwortliste geheim
    expect((await db.query("select * from public.accepted_answers")).rows).toHaveLength(0);
    expect((await db.query("select * from public.challenge_attempts")).rows).toHaveLength(2); // nur eigene
    expect((await db.query("select * from public.profiles")).rows).toHaveLength(1);
    await expect(db.exec(`update public.profiles set role='admin' where id='${u1}'`)).rejects.toThrow(/permission denied/);
    await db.exec(`update public.profiles set avatar='owl' where id='${u1}'`); // erlaubt
    await expect(db.exec(`insert into public.challenge_attempts (user_id, mode) values ('${u1}','daily')`)).rejects.toThrow(/row-level security/);
    await expect(db.exec(`select public.admin_save_question('{}'::jsonb)`)).rejects.toThrow(/permission denied/);
    expect((await db.query("select * from public.theme_packs")).rows).toHaveLength(15);

    // Rangliste: nur offizielle Wertungen, nur Name/Avatar/Punkte
    const lb = await db.query<{ username: string; points: number; is_me: boolean }>("select * from public.leaderboard('day', '2026-11-17')");
    expect(lb.rows.map((r) => [r.username, Number(r.points), r.is_me])).toEqual([["spieler_22222222", 420, false], ["anna", 300, true]]);
    const fr = await db.query("select * from public.leaderboard('all', '2026-11-17', 'friends')");
    expect(fr.rows).toHaveLength(1);
    await db.exec("reset role;");

    // Ranked: RP = 1000 + Summe der Deltas; laufende Runden zählen erst nach 30 Minuten
    await db.exec(`insert into public.challenge_attempts (user_id, mode, total, started_at, finished_at) values
      ('${u1}','ranked',520, now(), now()), ('${u1}','ranked',100, now(), now()),
      ('${u2}','ranked',700, now(), now()), ('${u2}','ranked',0, now(), null),
      ('${u2}','ranked',0, now() - interval '2 hours', null)`);
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${u1}', false);`);
    const rk = await db.query<{ username: string; rp: number; matches: number }>("select * from public.ranked_leaderboard(now() - interval '7 days')");
    expect(rk.rows.map((r) => [r.username, Number(r.rp), Number(r.matches)])).toEqual([["spieler_22222222", 1000 + 60 - 25, 2], ["anna", 1000 + 50 - 20, 2]]);
    await db.exec("reset role;");
    await db.close();
  }, 60_000);
});
