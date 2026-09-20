-- auth.users belongs to Supabase and the app cannot read it, so every climber
-- gets a row here: the public half of an account — the name and avatar shown
-- next to their comments and media.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;

create policy users_select_public on public.users for select using (true);

create policy users_write_own on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- New sign-ups get their row without the app having to remember to create it.
create function public.create_public_user() returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      ''
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_public_user();

-- Everyone who signed up before this migration.
insert into public.users (id, display_name, avatar_url)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(u.email, '@', 1),
    ''
  ),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;
