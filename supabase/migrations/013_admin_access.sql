alter table public.user_roles
  add column id_user_granted_by uuid references auth.users (id) on delete set null
    default auth.uid();

create policy user_roles_select_admin on public.user_roles
  for select using (public.is_admin());

-- The granter is the row's own author, never a name the client picks. A row
-- seeded by the service role has no `auth.uid()` and stays null.
create policy user_roles_insert_admin on public.user_roles
  for insert with check (
    public.is_admin() and id_user_granted_by is not distinct from auth.uid()
  );

create policy user_roles_delete_admin on public.user_roles
  for delete using (public.is_admin() and id_user <> auth.uid());

-- The email lives in `auth.users` because `users_select_public` hands
-- `public.users` to anonymous callers. Security definer leaves RLS behind, so
-- this checks `is_admin()` itself.
create function public.admin_directory(term text default null)
  returns table (
    id uuid,
    display_name text,
    avatar_url text,
    email text,
    is_admin boolean
  )
  language sql
  security definer
  stable
  set search_path = ''
as $$
  select
    u.id,
    u.display_name,
    u.avatar_url,
    a.email::text,
    r.id_user is not null
  from public.users u
  join auth.users a on a.id = u.id
  left join public.user_roles r on r.id_user = u.id and r.role = 'admin'
  where public.is_admin()
    and (
      (term is null and r.id_user is not null)
      or (term is not null and (
        u.display_name ilike '%' || term || '%'
        or a.email ilike '%' || term || '%'
      ))
    )
  order by u.display_name
  limit 50;
$$;

create index users_display_name_trgm_idx on public.users
  using gin (display_name gin_trgm_ops);

revoke execute on function public.admin_directory(text) from public;
grant execute on function public.admin_directory(text) to authenticated;
