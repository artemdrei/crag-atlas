-- What anybody, signed in or not, tells the maintainers about the app. It is
-- written once and read only by admins, through the API. The anon key gets
-- no select policy, so it cannot list what other people wrote.
--
-- `email` is a snapshot at the time of writing, filled from the session for
-- a member and typed by a guest, so a reply is possible either way and the
-- admin page needs no join into auth.users.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  id_user uuid references public.users (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  message text check (message is null or length(message) <= 800),
  email text check (email is null or length(email) <= 254),
  url text not null default '' check (length(url) <= 2000),
  app_version text not null default '' check (length(app_version) <= 40),
  platform text not null default '' check (length(platform) <= 40),
  created_at timestamptz not null default now()
);

create index feedback_created_at_idx on public.feedback (created_at desc, id desc);

alter table public.feedback enable row level security;

-- A member's row carries their own id, a guest's row carries none.
create policy feedback_insert_anyone on public.feedback
  for insert
  with check (id_user is null or id_user = auth.uid());

create policy feedback_select_admin on public.feedback
  for select using (public.is_admin());

-- An admin may take an entry down, and nothing more: there is no update
-- policy, so what somebody wrote is never edited by anyone else.
create policy feedback_delete_admin on public.feedback
  for delete using (public.is_admin());

-- The same ceilings the forms show. `not valid` leaves rows written before
-- the limit alone and checks only what is written from now on.
alter table public.ticks
  add constraint ticks_note_length check (note is null or length(note) <= 500)
  not valid;

alter table public.route_comments
  add constraint route_comments_body_length check (length(body) <= 500)
  not valid;

alter table public.sectors
  add constraint sectors_description_length check (length(description) <= 2000)
  not valid;

alter table public.routes
  add constraint routes_description_length check (length(description) <= 2000)
  not valid;
