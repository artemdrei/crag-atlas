# Archive and erase

The rules the catalog's soft delete has to keep. The steps that check them live
in `apps/e2e/specs/catalog/` — this page is what the code cannot say.

## Rules

- **Archiving takes a row out of the catalog and destroys nothing.** A direct
  link still opens it, and everything climbers left on it is still there.
- **Archiving cascades down.** A row whose ancestor is archived reads as
  archived without carrying a mark of its own, and the archive view lists only
  rows archived on their own.
- **Restoring brings descendants back**, except the ones archived separately —
  those keep their own state.
- **Erasing destroys rows for good, and it is refused while anything climbers
  made points at the row or anything under it.** Ascents, comments, photos and
  links all count. The API enforces it with a foreign-key restrict; the UI must
  not offer the action in the first place.
- **Erasing cascades sideways into the catalog.** A sector takes its routes, a
  region takes its sectors and their routes. The panel says how many.

## Where the rules live

| Rule | Enforced by |
|------|-------------|
| Cascade of erase | `on delete cascade`, `002_catalog.sql` |
| Refusal while content points at a row | `on delete restrict`, `004`, `005` |
| Derived `is_archived` | the stats views, `007_views_and_functions.sql` |
| What counts as content | `climber_content()`, `007_views_and_functions.sql` |
| Whether the button is offered | `ArchivedItemPanel`, `features/catalogEdit` |

## Known gaps

- **Backend messages reach the user untranslated.** When the API refuses an
  erase, the toast shows the server's English string inside a Ukrainian UI.
  With the button correctly disabled this is a safety net, but it applies to
  every domain error in the app.
- **Mobile is not covered.** Edit mode and the archive view are desktop-only
  today.
- **Creating and editing are not covered at all.** The specs build their
  fixture through the API, so no create form, no edit form and no topo line is
  ever driven by a test.

## Regression guards

**A deleted photo must take its file with it.** Storage checks `select` before
it deletes an object, and the `media` bucket carried no listing policy, so the
delete was answered "not found" and only logged a warning while the public URL
kept serving the file. Fixed by `media_select_own` in `006_storage.sql`, scoped
to the uploader and admins. Guarded by *the file behind a
deleted photo leaves the bucket*.

**An erased catalog row must take its photos with it.** Its descendants go by a
SQL cascade, which cannot reach storage, so `purge` reads every `storage_path`
under the row before the erase and removes the objects after it. Guarded by the
two scenarios that erase a sector and a region carrying a photo.

**The content count must be scoped, not global.** `climber_content` takes
`id_region` / `id_sector` / `id_route`, which are also column names on the
tables it joins; on a bare name the column wins, which turned the filter into
`s.id_region = s.id_region` and counted the whole catalog. Guarded by *an empty
region reads as empty and erases*.

**The count must be invalidated by every mutation of content.** It is cached
for five minutes with no refetch on focus, so deleting an ascent, a comment or
a photo has to invalidate `climberContents()` itself. Guarded by the scenarios
that delete content and read the note without reloading.

**The cascade warning counts only living children.** `route_count` and
`sector_count` come from views that join on `deleted_at is null`, so "Erasing
takes 1 route" can be followed by two routes being destroyed. Guarded by *the
warning does not count a separately archived route*.
