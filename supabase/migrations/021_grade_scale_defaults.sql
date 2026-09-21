-- Showing every grade as its guidebook wrote it turned out to be a setting
-- nobody wants to make: a climber reads in one system. Everyone now starts
-- with the pair this catalog is built on, and the preference is always set.

update public.users set grade_scale_route = 'french' where grade_scale_route is null;
update public.users set grade_scale_boulder = 'vscale' where grade_scale_boulder is null;

alter table public.users
  alter column grade_scale_route set default 'french',
  alter column grade_scale_route set not null,
  alter column grade_scale_boulder set default 'vscale',
  alter column grade_scale_boulder set not null;
