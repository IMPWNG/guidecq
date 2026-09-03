-- Achat des guides + accès membre.
-- À coller dans Supabase → SQL Editor.

create table if not exists public.guide_purchases (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text not null default '',
  guides text[] not null,
  amount_eur numeric(10,2) not null,
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'cancelled')),
  access_token text not null unique,
  payment_reference text not null unique,
  wise_transfer_id text,
  locale text not null default 'fr',
  message text not null default '',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create unique index if not exists guide_purchases_pending_amount_idx
  on public.guide_purchases (amount_eur)
  where status = 'pending';

create index if not exists guide_purchases_status_created_idx
  on public.guide_purchases (status, created_at desc);

alter table public.guide_purchases enable row level security;

drop policy if exists "guide_purchases_select" on public.guide_purchases;
create policy "guide_purchases_select"
  on public.guide_purchases for select to anon using (true);

drop policy if exists "guide_purchases_insert_pending" on public.guide_purchases;
create policy "guide_purchases_insert_pending"
  on public.guide_purchases for insert to anon
  with check (status = 'pending');

drop policy if exists "guide_purchases_update" on public.guide_purchases;
create policy "guide_purchases_update"
  on public.guide_purchases for update to anon using (true);

drop policy if exists "guide_purchases_delete" on public.guide_purchases;
create policy "guide_purchases_delete"
  on public.guide_purchases for delete to anon using (true);
