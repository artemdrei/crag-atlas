-- A belayer is usually not a registered climber: a friend, a local, somebody
-- met at the crag that morning. `id_partner` can only point at an account, so
-- the name written by hand is kept beside it — and only ever one of the two,
-- because a linked climber already carries a name of their own.
alter table public.ticks add column partner_name text;

alter table public.ticks add constraint ticks_partner_check
  check (id_partner is null or partner_name is null);
