-- Two findings from the Security Advisor, both about rights nothing uses.

-- A public bucket serves its bytes through /object/public/** without consulting
-- RLS, so this policy never took part in rendering a photo — all it granted was
-- storage.objects to anon, which is the file listing. With it in place an anon
-- key can enumerate every key in the bucket, including objects whose row is
-- gone but whose bytes a best-effort delete left behind.
drop policy if exists "topos_read_public" on storage.objects;
drop policy if exists "regions_read_public" on storage.objects;

-- create_public_user() is a trigger function: it runs as the table owner from
-- the trigger, and calling it directly is an error Postgres refuses. The
-- default EXECUTE to anon and authenticated buys nothing.
-- The default grant goes to PUBLIC, and revoking from a role does not touch a
-- privilege it holds that way, so PUBLIC has to go first.
revoke execute on function public.create_public_user() from public;
revoke execute on function public.create_public_user() from anon, authenticated;

-- is_admin() keeps its EXECUTE on purpose, whatever the advisor says about
-- SECURITY DEFINER: the catalog's write policies call it, and a policy's
-- expression runs as the role making the query, so authenticated must be able
-- to execute it. It reads one row — the caller's own, by auth.uid() — which
-- user_roles_select_own already allows anyone to read, and its search_path is
-- pinned. There is nothing to escalate.
