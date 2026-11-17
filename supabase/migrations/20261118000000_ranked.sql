-- =====================================================================
-- Ranked-Modus: wöchentliche Rangliste mit Ranglistenpunkten (RP)
-- Formel identisch zu src/lib/game/ranked.ts (rankedDelta)
-- =====================================================================

alter table public.challenge_attempts drop constraint if exists challenge_attempts_mode_check;
alter table public.challenge_attempts
  add constraint challenge_attempts_mode_check
  check (mode in ('daily', 'pack', 'training', 'unlimited', 'archive', 'ranked'));

create index if not exists challenge_attempts_ranked_idx
  on public.challenge_attempts (started_at) where mode = 'ranked';

create or replace function public.ranked_delta(points integer)
returns integer
language sql
immutable
as $$
  select greatest(-25, least(60, round((points - 220) / 6.0)::integer));
$$;

-- Abgebrochene Runden zählen nach 30 Minuten mit ihrem Zwischenstand –
-- schlechte Runden lassen sich nicht durch Abbrechen verstecken.
create or replace function public.ranked_leaderboard(season_start timestamptz, scope text default 'global', lim integer default 100)
returns table (rank bigint, username text, avatar text, rp bigint, matches bigint, best integer, is_me boolean)
language sql
stable
security definer
set search_path = public
as $$
  with circle as (
    select auth.uid() as uid
    union
    select case when f.user_id = auth.uid() then f.friend_id else f.user_id end
      from public.friendships f
     where f.status = 'accepted' and (f.user_id = auth.uid() or f.friend_id = auth.uid())
  ),
  scores as (
    select a.user_id,
           (1000 + sum(public.ranked_delta(a.total)))::bigint as rp,
           count(*)::bigint as matches,
           max(a.total)::integer as best
      from public.challenge_attempts a
     where a.mode = 'ranked'
       and a.started_at >= season_start
       and (a.finished_at is not null or a.started_at < now() - interval '30 minutes')
       and (scope <> 'friends' or a.user_id in (select uid from circle))
     group by a.user_id
  )
  select rank() over (order by s.rp desc, s.matches asc) as rank,
         pr.username, pr.avatar, s.rp, s.matches, s.best, (s.user_id = auth.uid()) as is_me
    from scores s
    join public.profiles pr on pr.id = s.user_id
   order by s.rp desc, s.matches asc
   limit greatest(1, least(lim, 200));
$$;

grant execute on function public.ranked_delta(integer) to authenticated;
grant execute on function public.ranked_leaderboard(timestamptz, text, integer) to authenticated;
