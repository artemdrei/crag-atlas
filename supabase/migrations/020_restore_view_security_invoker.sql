-- Migration 019 dropped and recreated both stats views and lost the setting
-- migration 008 had given them: a view without it runs as its owner and
-- quietly bypasses the RLS of the tables underneath.

alter view public.sectors_with_stats set (security_invoker = on);
alter view public.regions_with_stats set (security_invoker = on);
