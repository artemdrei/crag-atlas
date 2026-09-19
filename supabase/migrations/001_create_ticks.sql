-- Ticks: a climber's logged ascent of a route.
-- The route catalog still lives in static JSON inside apps/api, so id_route is
-- plain text here; it becomes a foreign key once the catalog moves to the DB.

create table public.ticks (
  id uuid primary key default gen_random_uuid(),
  id_user uuid not null references auth.users (id) on delete cascade,
  id_route text not null,
  ascent_style text not null check (
    ascent_style in (
      'onsight',
      'flash',
      'retro_flash',
      'redpoint',
      'toprope',
      'attempt'
    )
  ),
  climbed_at date not null default current_date,
  attempts integer check (attempts is null or attempts > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keeps updated_at honest: a client can't forge it, and no call site has to
-- remember to set it.
create function public.set_updated_at() returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ticks_set_updated_at
  before update on public.ticks
  for each row execute function public.set_updated_at();

create index ticks_id_user_climbed_at_idx
  on public.ticks (id_user, climbed_at desc);

create index ticks_id_route_idx on public.ticks (id_route);

alter table public.ticks enable row level security;

-- Every policy pins ownership to the caller: a client can never read or write
-- someone else's ticks, whatever id_user it sends.
create policy ticks_select_own on public.ticks
  for select using (auth.uid() = id_user);

create policy ticks_insert_own on public.ticks
  for insert with check (auth.uid() = id_user);

create policy ticks_update_own on public.ticks
  for update using (auth.uid() = id_user) with check (auth.uid() = id_user);

create policy ticks_delete_own on public.ticks
  for delete using (auth.uid() = id_user);
