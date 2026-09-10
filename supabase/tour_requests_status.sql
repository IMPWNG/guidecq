-- Statuts des demandes de tour.
-- À coller dans Supabase → SQL Editor → Run.
--
-- Nouveau parcours :
-- nouveau → en_cours (validation) → email_envoye → confirme → tour_en_cours → termine
-- + annule

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
