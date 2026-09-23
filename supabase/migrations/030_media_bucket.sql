-- Public bucket, like the other two: the photos are what a route page renders,
-- and a signed URL per image would only add expiry handling. A bucket created
-- by hand in the dashboard is left in place, but has to be public for
-- /object/public/** to serve it.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Unlike topos and regions, this bucket is not an admin's: a climber uploads
-- the photo of their own ascent. Storage stamps the uploader on the row, so
-- removing someone else's object stays impossible.
drop policy if exists "media_insert_authenticated" on storage.objects;
drop policy if exists "media_delete_own" on storage.objects;

create policy "media_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media');

create policy "media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (owner = auth.uid() or public.is_admin()));
