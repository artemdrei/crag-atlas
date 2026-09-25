-- 035 added the constraint NOT VALID because the rows already on the hosted
-- project predated it. They turned out to be clean — not one row carried both
-- a url and a storage path — so the constraint stops being a promise about
-- future writes only.
alter table public.route_media validate constraint route_media_url_or_path;
