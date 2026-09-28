-- A climber's own picture, uploaded over whatever the identity provider gave
-- them at sign-up. Public like the other image buckets: an avatar renders on
-- every comment and tick, and a signed URL per face would buy nothing.

insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Scoped to the uploader's own folder rather than the whole bucket, for the
-- reason 006_storage.sql spells out: a bucket-wide select on a public bucket
-- hands an anon key the listing of every object in it.
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- `avatar_url` keeps holding a full URL whatever its origin, so everything
-- that already reads it stays untouched. The path says whether the previous
-- picture is ours to delete or a provider's URL we must not touch.
alter table public.users add column avatar_path text;
