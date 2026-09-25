# What to cover next

Ordered by what breaks most often against what it costs. Each phase is one or
two spec files, built the way `README.md` describes: builders from
`fixtures/catalog.ts`, sentences as titles, `test.step` for the flow.

## Phase 1 — writing to the catalog ✅

`specs/catalog/create.e2e.ts`, `specs/catalog/edit.e2e.ts` — done.

Left out on purpose: dragging a sector's point on the map (the coordinates are
typed instead, which is the same save path), and a route's length, bolts and
type — the grade already covers the panel's save gate.

## Phase 2 — the topo editor ✅

`specs/topo/photos.e2e.ts`, `specs/topo/lines.e2e.ts` — done, with
`fixtures/canvas.ts` for the drawing surface.

Left for later: dragging a line from one photo to another (dnd-kit, and the
rule is already covered by `editorSessionReducer.spec.ts`), and reordering
photos and routes by drag.

## Phase 3 — what climbers leave ✅

`specs/climber/ticks.e2e.ts`, `specs/climber/comments.e2e.ts` — done, with a
second, non-admin account in `globalSetup` and its own `storageState`.

Left for later: the community feed, and the tick form's rating, grade opinion,
partner and media fields — the form's save path is covered through its
comment.

## Phase 4 — reading the catalog ✅

`specs/catalog/browse.e2e.ts` — done. The map is left out: it draws into a
canvas of its own and the coordinates it shows are already covered where they
are entered, on the sector form.

## Phase 5 — who may do what ✅

`specs/access/permissions.e2e.ts` — done, for a visitor, a climber and an
admin, in the UI and against the API.

## Phase 6 — app chrome ✅

`specs/app/preferences.e2e.ts` — done.

## Not yet

**Dragging.** Reordering photos and routes, and moving a line from one photo to
another, all go through dnd-kit. The rules themselves are covered by
`editorSessionReducer.spec.ts`; what is not covered is the gesture.

**The tick form's optional fields** — rating, grade opinion, partner, media —
and the community feed.

**On the phone**: the logbook's own list, the profile's settings (they are the
same components the desktop covers), and photo upload — there is no uploading
from a phone today.

