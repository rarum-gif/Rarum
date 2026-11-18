-- =====================================================================
-- Premium-Zahlungen (Stripe Checkout, Einmalzahlung)
-- Jede Checkout-Session schaltet höchstens einmal frei (Idempotenz).
-- =====================================================================
create table if not exists public.premium_payments (
  session_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount >= 0),
  currency text not null,
  payment_intent text,
  created_at timestamptz not null default now()
);
create index if not exists premium_payments_user_idx on public.premium_payments (user_id);
alter table public.premium_payments enable row level security;
drop policy if exists premium_payments_select_own on public.premium_payments;
create policy premium_payments_select_own on public.premium_payments for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.premium_payments from anon, authenticated;
