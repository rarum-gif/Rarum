-- =====================================================================
-- Rarum – Datenbankschema (Supabase / PostgreSQL)
-- ---------------------------------------------------------------------
-- Grundsätze
--  * Antwortlisten (questions, accepted_answers, answer_aliases,
--    rejected_answers) sind für Clients NICHT lesbar. Der Server
--    (Service-Role) liefert nur die Fragetexte aus und wertet Antworten aus.
--  * Spielstände (challenge_attempts, user_answers, user_stats …) werden
--    ausschliesslich serverseitig geschrieben. Clients dürfen nur lesen,
--    was ihnen gehört.
--  * Öffentlich sichtbar sind nur Benutzername, Avatar und Punktzahlen.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profile (Users = auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_.-]{3,24}$'),
  avatar text not null default 'fern',
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Konfiguration und Inhalte
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.rarity_tiers (
  id text primary key check (id in ('known', 'familiar', 'unusual', 'rare', 'very_rare', 'legendary')),
  label text not null,
  points integer not null check (points >= 0 and points <= 1000),
  rank smallint not null unique check (rank between 1 and 6)
);

create table if not exists public.theme_packs (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null,
  short text not null,
  tagline text not null default '',
  description text not null default '',
  topics text[] not null default '{}',
  accent text not null,
  accent_soft text not null,
  ink text not null,
  sort_order smallint not null default 0,
  cover_image text
);

create table if not exists public.questions (
  id text primary key,
  pack_id text not null references public.theme_packs (id) on update cascade,
  prompt text not null check (length(prompt) between 5 and 300),
  topic text not null default '',
  difficulty smallint not null default 2 check (difficulty between 1 and 3),
  time_limit_seconds integer check (time_limit_seconds is null or time_limit_seconds between 5 and 120),
  status text not null default 'draft' check (status in ('draft', 'review', 'verified', 'invalid')),
  sources jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists questions_pack_status_idx on public.questions (pack_id, status);

-- Gültige Antworten (AcceptedAnswers)
create table if not exists public.accepted_answers (
  id text primary key,
  question_id text not null references public.questions (id) on delete cascade,
  text text not null check (length(text) between 1 and 200),
  tier text not null references public.rarity_tiers (id),
  points_override integer check (points_override is null or points_override >= 0),
  explanation text not null default '',
  source jsonb,
  status text not null default 'verified' check (status in ('draft', 'review', 'verified', 'invalid')),
  position integer not null default 0
);
create index if not exists accepted_answers_question_idx on public.accepted_answers (question_id);

-- Alternative Schreibweisen / Synonyme (AnswerAliases)
create table if not exists public.answer_aliases (
  id bigserial primary key,
  answer_id text not null references public.accepted_answers (id) on delete cascade,
  alias text not null check (length(alias) between 1 and 200),
  unique (answer_id, alias)
);
create index if not exists answer_aliases_answer_idx on public.answer_aliases (answer_id);

-- Bekannte Falschantworten mit Erklärung
create table if not exists public.rejected_answers (
  id bigserial primary key,
  question_id text not null references public.questions (id) on delete cascade,
  text text not null,
  aliases text[] not null default '{}',
  explanation text not null default ''
);
create index if not exists rejected_answers_question_idx on public.rejected_answers (question_id);

-- AnswerOptions: Gesamtsicht auf alle hinterlegten Antwortmöglichkeiten
create or replace view public.answer_options as
  select a.id, a.question_id, a.text, 'accepted'::text as kind, a.tier, a.explanation
    from public.accepted_answers a
  union all
  select 'rejected:' || r.id, r.question_id, r.text, 'rejected'::text, null, r.explanation
    from public.rejected_answers r;

-- ---------------------------------------------------------------------
-- Tages-Sets (werden beim ersten Abruf eingefroren)
-- ---------------------------------------------------------------------
create table if not exists public.daily_challenges (
  id text primary key,
  date date not null unique,
  question_ids text[] not null,
  repeat_flags boolean[] not null,
  created_by text not null default 'auto' check (created_by in ('auto', 'admin')),
  published_at timestamptz not null default now(),
  check (cardinality(question_ids) = cardinality(repeat_flags))
);

create table if not exists public.daily_pack_challenges (
  id text primary key,
  pack_id text not null references public.theme_packs (id) on update cascade,
  date date not null,
  question_ids text[] not null,
  repeat_flags boolean[] not null,
  created_by text not null default 'auto' check (created_by in ('auto', 'admin')),
  published_at timestamptz not null default now(),
  unique (pack_id, date),
  check (cardinality(question_ids) = cardinality(repeat_flags))
);
create index if not exists daily_pack_challenges_date_idx on public.daily_pack_challenges (date);

-- ---------------------------------------------------------------------
-- Spielstände
-- ---------------------------------------------------------------------
create table if not exists public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('daily', 'pack', 'training', 'unlimited', 'archive')),
  official boolean not null default false,
  set_id text,
  set_date date,
  pack_id text references public.theme_packs (id) on update cascade,
  question_ids text[] not null default '{}',
  total integer not null default 0 check (total >= 0),
  max_total integer not null default 0 check (max_total >= 0),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  source text not null default 'live' check (source in ('live', 'import')),
  check (not official or set_id is not null)
);
-- Eine offizielle Wertung pro Nutzer und Tages-Set – auf Datenbankebene erzwungen
create unique index if not exists challenge_attempts_one_official
  on public.challenge_attempts (user_id, set_id) where official;
create index if not exists challenge_attempts_user_idx on public.challenge_attempts (user_id, started_at desc);
create index if not exists challenge_attempts_official_date_idx on public.challenge_attempts (set_date, mode) where official and finished_at is not null;

create table if not exists public.user_answers (
  attempt_id uuid not null references public.challenge_attempts (id) on delete cascade,
  position integer not null check (position >= 0),
  question_id text not null references public.questions (id) on delete cascade,
  started_at timestamptz not null default now(),
  answered_at timestamptz,
  input text check (input is null or length(input) <= 120),
  status text check (status in ('accepted', 'known_wrong', 'unknown', 'empty', 'timeout')),
  answer_id text,
  answer_text text,
  tier text references public.rarity_tiers (id),
  points integer not null default 0 check (points >= 0),
  primary key (attempt_id, position)
);

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_points integer not null default 0,
  official_count integer not null default 0,
  daily_count integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  best_daily integer not null default 0,
  rare_answers integer not null default 0,
  last_daily_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null,
  tier text not null check (tier in ('bronze', 'silver', 'gold'))
);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------
-- Freunde
-- ---------------------------------------------------------------------
create table if not exists public.friendships (
  user_id uuid not null references auth.users (id) on delete cascade,   -- anfragende Person
  friend_id uuid not null references auth.users (id) on delete cascade, -- angefragte Person
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
create index if not exists friendships_friend_idx on public.friendships (friend_id);

-- ---------------------------------------------------------------------
-- Meldungen zu unbekannten Antworten
-- ---------------------------------------------------------------------
create table if not exists public.answer_reports (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references public.questions (id) on delete cascade,
  answer_text text not null check (length(answer_text) between 1 and 120),
  note text check (note is null or length(note) <= 500),
  status text not null default 'open' check (status in ('open', 'accepted', 'rejected')),
  resolution text,
  reporter_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists answer_reports_status_idx on public.answer_reports (status, created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.rarity_tiers enable row level security;
alter table public.theme_packs enable row level security;
alter table public.questions enable row level security;
alter table public.accepted_answers enable row level security;
alter table public.answer_aliases enable row level security;
alter table public.rejected_answers enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_pack_challenges enable row level security;
alter table public.challenge_attempts enable row level security;
alter table public.user_answers enable row level security;
alter table public.user_stats enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.friendships enable row level security;
alter table public.answer_reports enable row level security;

-- Öffentliche, unkritische Konfiguration
create policy "settings readable" on public.app_settings for select using (true);
create policy "tiers readable" on public.rarity_tiers for select using (true);
create policy "packs readable" on public.theme_packs for select using (true);
create policy "achievements readable" on public.achievements for select using (true);

-- Profile: nur das eigene vollständig; Rolle ist nicht änderbar
create policy "own profile readable" on public.profiles for select using (id = auth.uid());
create policy "own profile updatable" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (username, avatar) on public.profiles to authenticated;

-- Zusätzliche Absicherung: Rolle und Einladungscode sind für Clients unveränderlich,
-- unabhängig davon, welche Tabellenrechte gesetzt sind.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') and (new.role is distinct from old.role or new.invite_code is distinct from old.invite_code or new.id is distinct from old.id) then
    raise exception 'permission denied: role/invite_code können nicht geändert werden';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Spielstände: nur lesen, nur eigene
create policy "own attempts readable" on public.challenge_attempts for select using (user_id = auth.uid());
create policy "own answers readable" on public.user_answers for select
  using (exists (select 1 from public.challenge_attempts a where a.id = attempt_id and a.user_id = auth.uid()));
create policy "own achievements readable" on public.user_achievements for select using (user_id = auth.uid());
-- user_stats enthält nur Zahlen (keine persönlichen Daten) und dient Realtime-Ranglisten
create policy "stats readable" on public.user_stats for select to authenticated using (true);

-- Freundschaften: beide Seiten dürfen lesen
create policy "own friendships readable" on public.friendships for select
  using (user_id = auth.uid() or friend_id = auth.uid());

-- questions, accepted_answers, answer_aliases, rejected_answers, daily_*,
-- answer_reports: keine Policies => für anon/authenticated gesperrt.

-- =====================================================================
-- Trigger: Profil bei Registrierung anlegen
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wanted text := coalesce(new.raw_user_meta_data ->> 'username', '');
  candidate text;
begin
  candidate := regexp_replace(wanted, '[^A-Za-z0-9_.-]', '', 'g');
  if length(candidate) < 3 or exists (select 1 from public.profiles where lower(username) = lower(candidate)) then
    candidate := 'spieler_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  insert into public.profiles (id, username) values (new.id, left(candidate, 24));
  insert into public.user_stats (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Admin: Frage inkl. Antworten atomar speichern (nur Service-Role)
-- =====================================================================
create or replace function public.admin_save_question(q jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  a jsonb;
  w jsonb;
  pos integer := 0;
  al text;
begin
  insert into public.questions (id, pack_id, prompt, topic, difficulty, time_limit_seconds, status, sources, notes, created_at, updated_at)
  values (
    q ->> 'id', q ->> 'packId', q ->> 'prompt', coalesce(q ->> 'topic', ''), coalesce((q ->> 'difficulty')::smallint, 2),
    nullif(q ->> 'timeLimitSeconds', '')::integer, coalesce(q ->> 'status', 'draft'), coalesce(q -> 'sources', '[]'::jsonb),
    q ->> 'notes', coalesce((q ->> 'createdAt')::timestamptz, now()), now()
  )
  on conflict (id) do update set
    pack_id = excluded.pack_id, prompt = excluded.prompt, topic = excluded.topic, difficulty = excluded.difficulty,
    time_limit_seconds = excluded.time_limit_seconds, status = excluded.status, sources = excluded.sources,
    notes = excluded.notes, updated_at = now();

  delete from public.accepted_answers where question_id = q ->> 'id';
  delete from public.rejected_answers where question_id = q ->> 'id';

  for a in select * from jsonb_array_elements(coalesce(q -> 'answers', '[]'::jsonb)) loop
    insert into public.accepted_answers (id, question_id, text, tier, points_override, explanation, source, status, position)
    values (
      a ->> 'id', q ->> 'id', a ->> 'text', a ->> 'tier', nullif(a ->> 'pointsOverride', '')::integer,
      coalesce(a ->> 'explanation', ''), case when jsonb_typeof(a -> 'source') = 'object' then a -> 'source' else null end,
      coalesce(a ->> 'status', 'verified'), pos
    );
    for al in select distinct x from jsonb_array_elements_text(coalesce(a -> 'aliases', '[]'::jsonb)) as t(x) loop
      insert into public.answer_aliases (answer_id, alias) values (a ->> 'id', al) on conflict do nothing;
    end loop;
    pos := pos + 1;
  end loop;

  for w in select * from jsonb_array_elements(coalesce(q -> 'wrongAnswers', '[]'::jsonb)) loop
    insert into public.rejected_answers (question_id, text, aliases, explanation)
    values (
      q ->> 'id', w ->> 'text',
      coalesce(array(select jsonb_array_elements_text(coalesce(w -> 'aliases', '[]'::jsonb))), '{}'),
      coalesce(w ->> 'explanation', '')
    );
  end loop;
end;
$$;

create or replace function public.admin_import_questions(qs jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  q jsonb;
  created integer := 0;
  updated integer := 0;
begin
  for q in select * from jsonb_array_elements(qs) loop
    if exists (select 1 from public.questions where id = q ->> 'id') then
      updated := updated + 1;
    else
      created := created + 1;
    end if;
    perform public.admin_save_question(q);
  end loop;
  return jsonb_build_object('created', created, 'updated', updated);
end;
$$;

revoke all on function public.admin_save_question(jsonb) from public, anon, authenticated;
revoke all on function public.admin_import_questions(jsonb) from public, anon, authenticated;

-- =====================================================================
-- Ranglisten (Leaderboards) – geben nur Benutzername, Avatar, Punkte zurück
-- period: 'day' | 'week' | 'all'   scope: 'global' | 'friends'
-- =====================================================================
create or replace function public.leaderboard(period text, ref_date date, scope text default 'global', lim integer default 50)
returns table (rank bigint, username text, avatar text, points bigint, challenges bigint, is_me boolean)
language sql
stable
security definer
set search_path = public
as $$
  with params as (
    select
      case period when 'week' then ref_date - ((extract(isodow from ref_date)::int) - 1) when 'day' then ref_date else date '1900-01-01' end as from_date,
      ref_date as to_date
  ),
  circle as (
    select auth.uid() as uid
    union
    select case when f.user_id = auth.uid() then f.friend_id else f.user_id end
      from public.friendships f
     where f.status = 'accepted' and (f.user_id = auth.uid() or f.friend_id = auth.uid())
  ),
  scores as (
    select a.user_id, sum(a.total)::bigint as points, count(*)::bigint as challenges
      from public.challenge_attempts a, params p
     where a.official and a.finished_at is not null
       and a.set_date between p.from_date and p.to_date
       and (period <> 'day' or a.mode = 'daily')
       and (scope <> 'friends' or a.user_id in (select uid from circle))
     group by a.user_id
  )
  select rank() over (order by s.points desc, s.challenges asc) as rank,
         pr.username, pr.avatar, s.points, s.challenges, (s.user_id = auth.uid()) as is_me
    from scores s
    join public.profiles pr on pr.id = s.user_id
   order by s.points desc, s.challenges asc
   limit greatest(1, least(lim, 200));
$$;

grant execute on function public.leaderboard(text, date, text, integer) to authenticated;

-- Komfortsicht für die Gesamtrangliste (Leaderboards)
create or replace view public.leaderboard_alltime as
  select pr.username, pr.avatar, s.total_points, s.official_count, s.longest_streak
    from public.user_stats s join public.profiles pr on pr.id = s.user_id
   order by s.total_points desc;
revoke all on public.leaderboard_alltime from anon;
grant select on public.leaderboard_alltime to authenticated;

-- Realtime für Ranglisten (nur wenn die Supabase-Publikation existiert)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table public.user_stats';
  end if;
end;
$$;
