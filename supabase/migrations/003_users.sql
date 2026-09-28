-- auth.users belongs to Supabase and the app cannot read it, so every climber
-- gets a row here: the public half of an account — the name and avatar shown
-- next to their comments and media, and the grade scales they read in.
--
-- Two scale preferences, not one: the grade a climber thinks in differs
-- between rope routes and boulders, and the two families never convert into
-- each other. Showing every grade as its guidebook wrote it turned out to be
-- a setting nobody wants to make, so both are always set.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  grade_scale_route text not null default 'french'
    check (grade_scale_route is null or grade_scale_route in (
      'french', 'yds', 'uiaa', 'saxon', 'ewbank', 'norwegian', 'brazilian_crux'
    )),
  grade_scale_boulder text not null default 'vscale'
    check (grade_scale_boulder is null or grade_scale_boulder in ('font', 'vscale')),
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

-- A trigger function runs as the table owner from the trigger, and calling it
-- directly is an error Postgres refuses: the default EXECUTE buys nothing.
-- The default grant goes to PUBLIC, and revoking from a role does not touch a
-- privilege it holds that way, so PUBLIC has to go first.
revoke execute on function public.create_public_user() from public;
revoke execute on function public.create_public_user() from anon, authenticated;
