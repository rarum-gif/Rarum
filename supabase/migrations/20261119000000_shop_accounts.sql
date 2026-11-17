-- =====================================================================
-- Shop-Käufe und anonyme Spielerkonten
-- =====================================================================

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);
alter table public.purchases enable row level security;

-- Lesen nur die eigenen Käufe; geschrieben wird ausschliesslich serverseitig
-- (Service-Role), nachdem der Kontostand aus den Runden nachgerechnet wurde.
drop policy if exists purchases_select_own on public.purchases;
create policy purchases_select_own on public.purchases for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.purchases from anon, authenticated;
