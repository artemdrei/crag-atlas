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
| 009 | `009_topos.sql` | Sector topo photos, route lines, and the storage bucket |
| 010 | `010_route_rating.sql` | Optional `routes.rating`, 0..5 |
| 011 | `011_import_mist_route_details.sql` | Ratings and bolt counts for the Mist sector |
| 012 | `012_drop_sector_approach_minutes.sql` | Empty: the drop it could not do moved to 019 |
| 013 | `013_route_stats.sql` | Optional ascent, onsight and grade-vote counts |
| 014 | `014_import_mist_route_stats.sql` | Those counts for the Mist sector |
| 015 | `015_users.sql` | Public `users`, created for every sign-up |
| 016 | `016_route_comments.sql` | Comments on a route, public read, own write |
| 017 | `017_route_media.sql` | Videos and photos linked to a route |
| 018 | `018_topo_editor.sql` | Photo dimensions, line bolts and anchor, label offsets |
| 019 | `019_grade_scales.sql` | Grade scale per route, grade system per user; drops `sectors.approach_minutes`, which 012 could not |
| 020 | `020_restore_view_security_invoker.sql` | Give the stats views back the setting 019 dropped |
| 021 | `021_grade_scale_defaults.sql` | Grade preferences default to French and V Scale, never null |
| 022 | `022_region_photo.sql` | Cover photo for a region, in its own bucket |
| 023 | `023_tighten_storage_and_grants.sql` | Drop the storage listing policies; revoke EXECUTE on the sign-up trigger |
| 024 | `024_drop_topo_label.sql` | Drop `topos.label`: a photo is named by its position |
| 025 | `025_one_line_per_route.sql` | `route_lines` is keyed by the route alone: one line per route, moved instead of copied |
| 026 | `026_grade_histogram.sql` | Grade spread per climbing type on both stats views |
| 027 | `027_public_ticks.sql` | Ticks readable by everyone; author FK and feed index |
| 028 | `028_tick_details.sql` | Tick rating, grade vote and partner; route stats carry on from the imported numbers; media can belong to a tick |
| 029 | `029_tick_grade_vote.sql` | `ascent_style` becomes `ascent_type`; the grade a tick proposes, and a note only its author sees |
| 030 | `030_media_bucket.sql` | The `media` bucket and its policies: any climber uploads a photo, only its owner removes it |
| 031 | `031_sector_coords.sql` | Sector coordinates, and the stats view rebuilt to carry them |
| 032 | `032_soft_delete_catalog.sql` | `deleted_at` on regions, sectors and routes; `is_archived` derived from a row's ancestors in the stats views |
| 033 | `033_protect_climber_content.sql` | Comments and media hold a route back the way ascents already did: erasing for good cannot destroy a climber's work |
| 034 | `034_climber_content.sql` | `climber_content()`: what climbers left under a catalog row, in one query |
