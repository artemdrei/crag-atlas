# Migrations

Plain SQL, applied in order. One file per change, named `NNN_short_name.sql`
with a zero-padded sequence number.

The series was renumbered once, at the squash that collapsed the first 43
incremental files into the seven below: they described a schema nobody had
ever built in one pass, half of them undoing the other half. From here on the
old rule stands again — never renumbered, never edited once applied. A mistake
is fixed by the next migration.

Apply a migration in the Supabase dashboard (SQL Editor) or with
`psql "$DATABASE_URL" -f supabase/migrations/NNN_short_name.sql`.
`supabase db reset` replays the whole series on the local stack. It ships no
data: the catalog starts empty and is filled from the editor or by an import.

| # | File | What it does |
|---|------|--------------|
| 001 | `001_foundation.sql` | `pg_trgm`, `set_updated_at()`, `user_roles` and `is_admin()` — what the rest leans on |
| 002 | `002_catalog.sql` | `regions` / `sectors` / `routes`: uuid keys, Latin `name` beside `name_local`, coordinates, grade scale and score, soft delete; public read, admin write |
| 003 | `003_users.sql` | Public `users`, created for every sign-up, with the grade scales a climber reads in |
| 004 | `004_ticks.sql` | Logged ascents: public to read, own to write, with rating, grade vote and partner |
| 005 | `005_climber_content.sql` | `route_comments`, `route_media`, `topos` and `route_lines` — and the restrict that stops an erase destroying them |
| 006 | `006_storage.sql` | The `topos`, `regions` and `media` buckets, and who may write to each |
| 007 | `007_views_and_functions.sql` | The stats views behind every catalog page, plus `climber_content()`, `tick_page()`, `tick_stats()` and `catalog_search()` |
| 011 | `011_external_ascents.sql` | `routes.id_route_8a` and the tick key `(id_user, id_route, climbed_at)` — what makes a re-parse from 8a land on the same rows |
| 012 | `012_tick_partner_name.sql` | `ticks.partner_name` — the belayer who has no account here, written by hand instead of linked |
| 013 | `013_admin_access.sql` | Admin-scoped policies on `user_roles`, `id_user_granted_by` and `admin_directory()` — admins grant and revoke the role, never their own |
| 014 | `014_tick_weather.sql` | `ticks.climbed_at_time` and `tick_weather` — the hour of an ascent and the conditions it was climbed in |
| 015 | `015_search_route_stats.sql` | Ascent counts and rating on a search hit, read from `routes_with_stats` |
| 016 | `016_sector_conditions.sql` | `sectors.aspect_deg` / `sectors.shelter` and `sector_horizon` — which way a wall faces, whether rain reaches it, and the skyline around it |
