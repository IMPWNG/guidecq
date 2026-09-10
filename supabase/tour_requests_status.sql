-- À coller dans Supabase → SQL Editor → Run.
--
-- 1) Autorise l’admin à ENREGISTRER (dates, statuts, suppression).
--    Sans ça, l’écran change mais un refresh ramène l’ancienne valeur.
-- 2) Ajoute le statut "tour_en_cours" et met "nouveau" par défaut.

alter table public.tour_requests
  add column if not exists jours_visite date[] default '{}';

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

update public.tour_requests
set status = 'nouveau'
where status is null or btrim(status) = '';

alter table public.tour_requests
  alter column status set default 'nouveau';

alter table public.tour_requests
  drop constraint if exists tour_requests_status_check;

alter table public.tour_requests
  add constraint tour_requests_status_check
  check (
    status in (
      'nouveau',
      'en_cours',
      'email_envoye',
      'confirme',
      'tour_en_cours',
      'termine',
      'annule'
    )
  );
