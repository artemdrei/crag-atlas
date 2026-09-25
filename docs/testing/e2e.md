# Running the automated flows

The browser half of the rules in [`archive-and-erase.md`](./archive-and-erase.md).
What the database decides is checked a layer down, in
`apps/api/src/**/*.int.spec.ts`.

| File | Covers |
|------|--------|
| `specs/catalog/archive.e2e.ts` | Archiving a route, sector and region, what each dialog says, the cascade, and restore |
| `specs/catalog/erase.e2e.ts` | Erasing, what blocks it, and how far it reaches |
| `specs/catalog/media.e2e.ts` | Links and uploaded photos as content, and the upload's WebP check |
| `specs/catalog/create.e2e.ts` | Creating a region, a sector and a route, and what each form insists on |
| `specs/catalog/edit.e2e.ts` | Editing them: the unsaved mark, the save, and dropping an edit |
| `specs/topo/photos.e2e.ts` | Uploading, replacing and deleting a sector's photos |
| `specs/topo/lines.e2e.ts` | Drawing a route on a photo, moving a point, undo/redo, deleting a line |
| `specs/climber/ticks.e2e.ts` | Logging, editing and deleting an ascent, and who may read a private note |
| `specs/climber/comments.e2e.ts` | Posting beta, and who may rewrite or remove it |
| `specs/catalog/browse.e2e.ts` | Walking down to a route and back, and the grade filter |
| `specs/access/permissions.e2e.ts` | What a visitor, a climber and an admin are each offered |
| `specs/app/preferences.e2e.ts` | Language and theme, and that both survive a reload |
| `specs/mobile/*.e2e.ts` | The phone's own tree: bottom navigation, sheets, topo gallery, and what a visitor is offered |

Still manual: drag gestures and the tick form's optional fields. See
[`backlog.md`](./backlog.md).

## Once, on a new machine
     
A container runtime is the only prerequisite. Docker Desktop works; so does
colima, which needs no GUI:

```sh
brew install colima docker
colima start --cpu 4 --memory 8 --disk 40
```

```sh
supabase start   # applies supabase/migrations on first boot, in file order
```

Copy the keys `supabase status` prints into `apps/e2e/.env` and
`apps/api/.env.integration` (both `.env.example` files list the names). The app
`.env` files are left alone: Playwright starts its own servers with the local
stack passed through the environment, on ports 4100 and 4101, so a dev server
running on 4000/4001 against a hosted project is never touched. Both suites
refuse to start unless `SUPABASE_URL` is a local host — they erase rows.

## Running

```sh
pnpm --filter api test:integration
pnpm --filter @crag-atlas/e2e exec playwright install chromium webkit   # once
pnpm --filter @crag-atlas/e2e test:e2e
```

`pnpm test` runs neither: unit tests must stay runnable without a database.

Both suites are green as of this writing: 6 integration tests and 66 browser
scenarios — 55 on a desktop Chrome, 11 on an iPhone 17 — about two minutes for
the browser half.

## How the suite gets in

- **Sign-in.** The app offers Google and an emailed code, neither of which a
  test can drive. `setup/globalSetup.ts` creates two accounts through the Auth
  Admin API — an admin and an ordinary climber — signs each in with a password,
  and writes the sessions straight into the storage key the web client reads,
  together with `crag-atlas:locale` set to `en`. A spec that needs the climber
  says so with `test.use({ storageState: STORAGE_STATE_MEMBER })`.
- **Fixture.** Built through the API, not through the create forms, under a
  per-run prefix. Teardown is best-effort: the scenarios that erase rows for
  good leave part of the tree already gone.
- **Two projects.** `desktop` runs everything outside `specs/mobile/`, and
  `mobile` runs only what is in it, on WebKit with an iPhone 17 user agent.
  The app reads that agent (`react-device-detect`) and renders a different
  tree, so a phone is not a narrow desktop: it has its own pages, a bottom
  navigation instead of a header, sheets instead of dialogs, and no edit mode
  at all.
- **Order.** One worker, serial: the scenarios share a catalog and three of
  them destroy part of it.
- **Drawing.** The editor's overlay carries no roles or names, so
  `fixtures/canvas.ts` points at fractions of the photo on screen. It needs a
  real photo to point at — `fixtures/wall.webp`, 1600×1200 — because a
  one-pixel image renders one pixel wide.
- **Waiting.** Erase is fired by the page without any navigation behind it, so
  the specs poll the API for the row to disappear rather than reading it once —
  the row leaving the archive list happens before the request lands.

Files uploaded by earlier runs stay in the storage volume even after
`supabase db reset` — the reset empties the database, including
`storage.objects`, but not the volume's files. `supabase stop --no-backup`
removes the volume with them.

`[analytics]` is off in `supabase/config.toml`: its vector container
bind-mounts the host docker socket, which a VM-backed runtime such as colima
cannot do.

R8 has been mutation-tested: dropping the `climberContents()` invalidation from
`useApiDeleteTick` turns it red on the note, not on a timeout. It is a real
guard, and it stays one only while nothing reloads the page between deleting
the content and reading the note.
