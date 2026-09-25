# Testing

Three layers, split by who decides the thing being checked.

| Layer | Where | Runs with | Checks |
|-------|-------|-----------|--------|
| Unit | `*.spec.ts` next to the code | `pnpm test` | Pure functions: grades, line geometry, the editor reducer |
| Integration | `apps/api/src/**/*.int.spec.ts` | `pnpm --filter api test:integration` | What the schema decides: cascade, restrict, derived columns, SQL functions |
| E2E | `apps/e2e/specs/**/*.e2e.ts` | `pnpm --filter @crag-atlas/e2e test:e2e` | What the interface decides: which button is offered, what the dialog says |

Rule of thumb: if the assertion can be written without the word "button" or
"dialog", it belongs in the integration layer.

## How specs find things

In [Testing Library's order](https://testing-library.com/docs/queries/about/#priority),
because it is the order of how close a query is to what a person perceives:

1. `getByRole` with a name — the default, and what nearly every step uses
2. `getByLabel` for a form field that has no role-plus-name of its own
3. `getByText` for copy the reader is meant to read
4. `getByAltText` / `getByTitle` for images
5. CSS or structure — last resort, and each one carries a comment saying why

Two places in this suite sit at that last step, on purpose:

- `fixtures/canvas.ts` reaches for `.topoEditHandle`. The editor exports that
  class precisely so a point can be told from the line under it; the markers
  are SVG shapes with no role to ask for.
- `formWith` scopes to the surrounding `form`. Several panels can be on screen
  at once, each with a field called `Name`.

## Conventions

- **One file per feature and action** — `specs/catalog/archive.e2e.ts`,
  `erase.e2e.ts`, `media.e2e.ts`. No numeric prefixes: a file that has to run
  after another cannot be run alone.
- **`specs/mobile/` is the phone's own set.** The app renders a different tree
  under a phone's user agent, so those specs run in their own project and
  nothing else does.
- **Test titles are sentences**, not ids. The flow inside one is spelled out
  with `test.step`, which is what the report and the trace show.
- **Each file builds the fixture it needs** from the builders in
  `fixtures/catalog.ts` and ends with `cleanup`.
- **Fixture names never contain one another.** Rows are found on screen by
  name, and the match is a substring.
- **Source strings are English.** `globalSetup` pins the locale to `en`, so a
  spec asserts what `lingui extract` sees.
- **Specs navigate by URL**, not by clicking a path through the catalog.

## Pages

- [`archive-and-erase.md`](./archive-and-erase.md) — the rules the catalog's
  soft delete keeps, and the bugs still open against them
- [`e2e.md`](./e2e.md) — how to run the browser suite and how it signs in
- [`backlog.md`](./backlog.md) — the flows still to cover, in the order worth
  doing them
