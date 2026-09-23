-- A logbook is public, the way it is on 8a.nu or theCrag: everyone reads every
-- ascent, and only the climber writes their own.
drop policy ticks_select_own on public.ticks;

create policy ticks_select_public on public.ticks
  for select using (true);

-- Repointed at public.users so a feed row carries its author's name and avatar
-- in the same query, the way route comments already do.
alter table public.ticks drop constraint ticks_id_user_fkey;

alter table public.ticks
  add constraint ticks_id_user_fkey foreign key (id_user)
    references public.users (id) on delete cascade;

-- The feed pages by climb date and breaks ties by id, so the cursor never
-- skips or repeats a row.
create index ticks_climbed_at_id_idx on public.ticks (climbed_at desc, id desc);
