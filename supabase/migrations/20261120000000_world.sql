-- =====================================================================
-- Spielwelt: Spielfigur, Grundstück, Premium, stapelbare Gegenstände,
-- Weltkarten-Modus
-- =====================================================================

-- Spielfigur und Grundstück werden nur serverseitig geschrieben (Service-Role),
-- nachdem geprüft wurde, dass alle Gegenstände dem Spieler gehören.
alter table public.profiles add column if not exists character jsonb;
alter table public.profiles add column if not exists estate jsonb;
alter table public.profiles add column if not exists premium_until timestamptz;

-- Rolle, Einladungscode und Premium bleiben für Clients unveränderlich
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') and (
    new.role is distinct from old.role or new.invite_code is distinct from old.invite_code or new.id is distinct from old.id
    or new.premium_until is distinct from old.premium_until or new.character is distinct from old.character or new.estate is distinct from old.estate
  ) then
    raise exception 'permission denied: geschützte Profilspalten';
  end if;
  return new;
end;
$$;

-- Deko wie Palmen oder Laternen kann man mehrfach besitzen
alter table public.purchases drop constraint if exists purchases_user_id_item_id_key;
create index if not exists purchases_user_idx on public.purchases (user_id, item_id);

-- Eingelöste Premium-Codes (ein Code pro Konto nur einmal)
create table if not exists public.premium_redemptions (
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  days integer not null check (days between 1 and 3660),
  created_at timestamptz not null default now(),
  primary key (user_id, code)
);
alter table public.premium_redemptions enable row level security;
drop policy if exists premium_redemptions_select_own on public.premium_redemptions;
create policy premium_redemptions_select_own on public.premium_redemptions for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.premium_redemptions from anon, authenticated;

-- Neuer Spielmodus: Weltkarte
alter table public.challenge_attempts drop constraint if exists challenge_attempts_mode_check;
alter table public.challenge_attempts
  add constraint challenge_attempts_mode_check
  check (mode in ('daily', 'pack', 'training', 'unlimited', 'archive', 'ranked', 'atlas'));

-- Weltkarten-Fragen stehen nicht in der Fragentabelle (Orte statt Antwortlisten)
alter table public.user_answers drop constraint if exists user_answers_question_id_fkey;
