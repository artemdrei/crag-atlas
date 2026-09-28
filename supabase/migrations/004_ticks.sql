-- A climber's logged ascent of a route. Everyone may read a tick — the feed
-- and a route's ascent list are public — but only its author may write one,
-- and `note_private` keeps a note visible to nobody else.
--
-- `grade_opinion` is the soft/neutral/hard vote that feeds a route's stats;
-- `grade_vote` is the grade this climber would give the route instead.

create table public.ticks (
  id uuid primary key default gen_random_uuid(),
  id_user uuid not null references public.users (id) on delete cascade,
  -- Erasing a route for good must not destroy a climber's ascents, so the
  -- route is held back by the tick rather than taking it along.
  id_route uuid not null references public.routes (id) on delete restrict,
  ascent_type text not null constraint ticks_ascent_type_check check (
    ascent_type in (
      'onsight', 'flash', 'retro_flash', 'redpoint', 'toprope', 'attempt'
    )
  ),
  climbed_at date not null default current_date,
  attempts integer check (attempts is null or attempts > 0),
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  grade_opinion text
    check (grade_opinion is null or grade_opinion in ('soft', 'neutral', 'hard')),
  grade_vote text,
  id_partner uuid references public.users (id) on delete set null,
  note text,
  note_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ticks_id_route_idx on public.ticks (id_route);
create index ticks_id_user_climbed_at_idx on public.ticks (id_user, climbed_at desc);
-- The public feed orders by date across every user; the id breaks the tie so
-- a keyset page never repeats or skips a row.
create index ticks_climbed_at_id_idx on public.ticks (climbed_at desc, id desc);

create trigger ticks_set_updated_at
  before update on public.ticks
  for each row execute function public.set_updated_at();

alter table public.ticks enable row level security;

create policy ticks_select_public on public.ticks for select using (true);

create policy ticks_insert_own on public.ticks
  for insert with check (auth.uid() = id_user);

create policy ticks_update_own on public.ticks
  for update using (auth.uid() = id_user) with check (auth.uid() = id_user);

create policy ticks_delete_own on public.ticks
  for delete using (auth.uid() = id_user);
