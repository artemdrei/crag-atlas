-- 028 gave route_media a storage_path so an uploaded photo could keep its file,
-- but left `url` NOT NULL from 017, when a link was the only kind there was.
-- The API has written `url: null` for uploads ever since and every one of them
-- failed on the constraint; nothing caught it because the column was relaxed by
-- hand on the hosted project and never in a migration.
alter table public.route_media alter column url drop not null;

-- A media row is one thing or the other, never neither: a link has a url, an
-- upload has a path into the bucket. NOT VALID because the rows already in the
-- hosted project were written while the constraint did not exist — it guards
-- every write from here on, and history is left alone.
alter table public.route_media
  add constraint route_media_url_or_path
    check (num_nonnulls(url, storage_path) = 1) not valid;
