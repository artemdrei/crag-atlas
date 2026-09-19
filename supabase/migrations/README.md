# Migrations

Plain SQL, applied in order. One file per change, named `NNN_short_name.sql`
with a zero-padded sequence number — never renumbered, never edited once
applied: a mistake is fixed by the next migration.

Apply a migration in the Supabase dashboard (SQL Editor) or with
`psql "$DATABASE_URL" -f supabase/migrations/NNN_short_name.sql`.

| # | File | What it does |
|---|------|--------------|
| 001 | `001_create_ticks.sql` | `ticks` table (logged ascents) with per-user RLS |
| 002 | `002_pin_function_search_path.sql` | Pin `search_path` on `set_updated_at` |
| 003 | `003_create_catalog.sql` | `regions` / `sectors` / `routes`, public read-only |
| 004 | `004_seed_catalog.sql` | Demo catalog moved over from the static JSON |
| 005 | `005_link_ticks_to_routes.sql` | FK from `ticks.id_route` to `routes.id` |
| 006 | `006_catalog_uuid_keys.sql` | Catalog keys become uuids; names stay labels |
| 007 | `007_admin_role.sql` | `user_roles` + `is_admin()`; catalog writes for admins |
| 008 | `008_computed_catalog_stats.sql` | Counts and grade ranges become views |
