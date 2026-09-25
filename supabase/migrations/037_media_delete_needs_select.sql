-- Deleting a photo left its file behind. Storage checks `select` before it
-- will delete an object, and 023 dropped every listing policy from this
-- bucket, so the API asked for a row the policy hid from it: the delete was
-- answered "not found" and only logged a warning, while the public URL kept
-- serving the file for good.
--
-- Narrower than what 023 removed: an uploader sees their own objects, an admin
-- sees all of them, and nobody gets to list the bucket. Reading a photo has
-- never gone through this policy — /object/public/** serves it either way.
create policy "media_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media' and (owner = auth.uid() or public.is_admin())
  );
