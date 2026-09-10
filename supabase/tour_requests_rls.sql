-- Policies + RLS pour public.tour_requests.
-- À coller dans Supabase → SQL Editor → Run.

alter table public.tour_requests enable row level security;

grant select, insert, update, delete on table public.tour_requests to anon, authenticated;

drop policy if exists tour_requests_update_all on public.tour_requests;
create policy tour_requests_update_all
on public.tour_requests
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists tour_requests_delete_all on public.tour_requests;
create policy tour_requests_delete_all
on public.tour_requests
for delete
to anon, authenticated
using (true);
