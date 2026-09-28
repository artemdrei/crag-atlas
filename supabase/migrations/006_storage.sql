-- Three public buckets: the images are what a page renders, and a signed URL
-- per image would only add expiry handling to a catalog everyone may read.
--
-- There is deliberately no `for select using (bucket_id = …)` policy for the
-- public ones. A public bucket serves its bytes through /object/public/**
-- without consulting RLS, so such a policy never took part in rendering a
-- photo — all it granted was the file listing, which lets an anon key
-- enumerate every key in the bucket, including objects whose row is gone but
-- whose bytes a best-effort delete left behind.

insert into storage.buckets (id, name, public) values
  ('topos', 'topos', true),
  ('regions', 'regions', true),
  ('media', 'media', true)
on conflict (id) do update set public = true;

create policy "topos_write_admin" on storage.objects
  for all using (bucket_id = 'topos' and public.is_admin())
  with check (bucket_id = 'topos' and public.is_admin());

create policy "regions_write_admin" on storage.objects
  for all using (bucket_id = 'regions' and public.is_admin())
  with check (bucket_id = 'regions' and public.is_admin());

-- Unlike the other two, this bucket is not an admin's: a climber uploads the
-- photo of their own ascent. Storage stamps the uploader on the row, so
-- removing someone else's object stays impossible.
create policy "media_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media');

-- Storage has to be able to see an object to delete it, and a public bucket's
-- bytes being readable does not make its rows readable. Without the select
-- the delete found nothing to remove and the public URL kept serving the file.
create policy "media_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (owner = auth.uid() or public.is_admin()));

create policy "media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (owner = auth.uid() or public.is_admin()));
