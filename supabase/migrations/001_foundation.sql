-- What every other migration leans on: the trigram search support, the
-- updated_at trigger function, and the admin role the catalog's write
-- policies are expressed in. It has to come first — a policy resolves
-- `is_admin()` at CREATE POLICY time, not at query time.

create extension if not exists pg_trgm;

create function public.set_updated_at() returns trigger
  language plpgsql
  -- Supabase's Security Advisor flags functions without a fixed search_path:
  -- their behaviour otherwise depends on the caller's. This one touches no
  -- tables, so an empty path is enough.
  set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Editing the catalog needs a role the database can check, not a flag the
-- client sends. One row per admin; everyone else is simply absent.
create table public.user_roles (
  id_user uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- A user may see their own role (the app asks "am I an admin?"), and only the
-- service role may hand one out — there is no self-promotion path.
create policy user_roles_select_own on public.user_roles
  for select using (auth.uid() = id_user);

-- security definer so the policies below can read the table without every
-- caller needing select rights on it.
--
-- It keeps its EXECUTE grant on purpose, whatever the advisor says about
-- SECURITY DEFINER: the catalog's write policies call it, a policy expression
-- runs as the role making the query, so `authenticated` must be able to
-- execute it. It reads one row — the caller's own, by auth.uid() — which
-- user_roles_select_own already lets anyone read. There is nothing to escalate.
create function public.is_admin() returns boolean
  language sql
  security definer
  stable
  set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where id_user = auth.uid() and role = 'admin'
  );
$$;
