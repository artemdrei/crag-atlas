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
| Cascade of erase | `on delete cascade`, `006_catalog_uuid_keys.sql` |
| Refusal while content points at a row | `on delete restrict`, `005`, `033` |
| Derived `is_archived` | the stats views, `032_soft_delete_catalog.sql` |
| What counts as content | `climber_content()`, `034_climber_content.sql` |
| Whether the button is offered | `ArchivedItemPanel`, `features/catalogEdit` |

## Known gaps

- **A deleted photo leaves its file behind.** The row goes, the object stays in
  the public `media` bucket: 023 dropped the storage listing policies, so the
  bucket has no `select` policy, the storage API cannot see the object it is
  asked to delete, and `removePhoto` only logs a warning. The fix is a
  decision — a `select` policy scoped to the bucket, or deleting the object
  with a service-role client inside `media.service.remove`. A `test.fail` in
  `media.e2e.ts` holds the place: it goes green, and the suite red, the day
  somebody fixes it.
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
