-- Supabase's Security Advisor flags functions without a fixed search_path:
-- their behaviour otherwise depends on the caller's search_path. The function
-- touches no tables, so an empty one is enough.

alter function public.set_updated_at() set search_path = '';
