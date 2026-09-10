-- Security Advisor : "Policy Exists RLS Disabled" + "RLS Disabled in Public"
-- sur public.tour_requests.
--
-- Les policies existent déjà, mais sans RLS elles ne s’appliquent pas.
-- Cette ligne les active. À coller dans Supabase → SQL Editor → Run.

alter table public.tour_requests enable row level security;
