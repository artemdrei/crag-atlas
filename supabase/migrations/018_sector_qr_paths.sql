-- A QR plaque on the rock carries a path, never an id: ids change on a
-- re-import, page URLs change with the app, and a plaque is printed once.
-- `regions.qr_slug` is the region part of every path under it, set the first
-- time one of its sectors gets a code and never derived from the name again,
-- so renaming a region leaves its prints alone.
alter table public.regions
  add column qr_slug text constraint regions_qr_slug_format
    check (
      qr_slug is null
      or (qr_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(qr_slug) <= 40)
    );

create unique index regions_country_qr_slug_idx
  on public.regions (country, qr_slug)
  where qr_slug is not null;

-- `country/region/sector`, the part of the printed URL after `/q/`. Rows are
-- only ever added: a new slug becomes the current path and the old one keeps
-- resolving, so no plaque already on the rock goes dead. They leave only with
-- their sector.
create table public.sector_qr_paths (
  id uuid primary key default gen_random_uuid(),
  id_sector uuid not null references public.sectors (id) on delete cascade,
  path text not null unique constraint sector_qr_paths_path_format
    check (
      path ~ '^[a-z]{2}/[a-z0-9]+(-[a-z0-9]+)*/[a-z0-9]+(-[a-z0-9]+)*$'
      and length(split_part(path, '/', 2)) <= 40
      and length(split_part(path, '/', 3)) <= 40
    ),
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index sector_qr_paths_current_idx
  on public.sector_qr_paths (id_sector)
  where is_current;

alter table public.sector_qr_paths enable row level security;

create policy sector_qr_paths_select_public on public.sector_qr_paths
  for select using (true);

create policy sector_qr_paths_insert_admin on public.sector_qr_paths
  for insert with check (public.is_admin());

create policy sector_qr_paths_update_admin on public.sector_qr_paths
  for update using (public.is_admin());

-- Only `is_current` may move. A path pointed somewhere else would send every
-- plaque printed with it to the wrong wall.
create function public.keep_sector_qr_path() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  if new.path <> old.path
    or new.id_sector <> old.id_sector
    or new.created_at <> old.created_at then
    raise exception 'A QR path never changes once written'
      using errcode = 'CA002';
  end if;

  return new;
end;
$$;

create trigger sector_qr_paths_keep
  before update on public.sector_qr_paths
  for each row
  execute function public.keep_sector_qr_path();

-- One call so the old current path is retired and the new one written
-- together: a sector is never left with two current paths or none. Going back
-- to a path the sector had before revives that row rather than adding a twin.
create function public.set_sector_qr_path(target uuid, new_path text)
  returns void
  language plpgsql
  set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.sector_qr_paths
    where path = new_path and id_sector <> target
  ) then
    raise exception 'Another sector already uses this QR path'
      using errcode = 'CA003';
  end if;

  update public.sector_qr_paths
  set is_current = false
  where id_sector = target and is_current and path <> new_path;

  insert into public.sector_qr_paths (id_sector, path)
  values (target, new_path)
  on conflict (path) do update set is_current = true;
end;
$$;

revoke execute on function public.set_sector_qr_path(uuid, text) from public;
grant execute on function public.set_sector_qr_path(uuid, text) to authenticated;
