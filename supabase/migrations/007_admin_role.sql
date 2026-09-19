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
-- caller needing select rights on it; search_path pinned, as the advisor asks.
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

-- Catalog writes: admins only. Reads stay public (policies from 003/006).
create policy regions_write_admin on public.regions
  for all using (public.is_admin()) with check (public.is_admin());

create policy sectors_write_admin on public.sectors
  for all using (public.is_admin()) with check (public.is_admin());

create policy routes_write_admin on public.routes
  for all using (public.is_admin()) with check (public.is_admin());
