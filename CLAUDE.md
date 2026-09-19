# crag-atlas — Project Rules

Open-source climbing routes platform: crags → sectors → routes → photos with
topo lines. This repo has no relation to any other project on this machine —
do not port data, secrets, or assumptions from elsewhere.

## ⚠️ Behavior Rules (read first, always)

- NEVER write code before reading relevant files.
- In planning mode: file list + summary ONLY, no code.
- If unsure what exists — grep/read first, then propose.
- Open source: no secrets, tokens, or personal data ever committed. Anything
  sensitive goes in `.env` (gitignored) or Supabase secrets.

## Stack

- Communication: **Ukrainian**. Code, comments, git, docs, README: **English**
  (open-source audience is not Ukrainian-only).
- Supabase (PostgreSQL) — DB types auto-generated, never hand-edit generated
  output.
- Turborepo + pnpm workspaces.
- Frontend: React + TypeScript + Vite + MUI.
- Backend: NestJS.
- i18n: Lingui, locales `en` and `uk`. Every user-facing string goes through
  `t()`/`<Trans>` from day one — no hardcoded strings "to add i18n later."

## Frontend Structure (FSD-lite)

```
apps/web/src/
  app/
    App.tsx           — picks AppDesktop or AppMobile via react-device-detect
    desktop/
      AppDesktop.tsx  — desktop route tree
      layout/         — AppLayoutDesktop etc., own index.ts barrel
    mobile/
      AppMobile.tsx   — mobile route tree
      layout/         — HeaderMobile, AppBottomNavigation, own index.ts barrel
    providers/        — AppProviders (theme + i18n), own index.ts barrel
    router/           — Router.tsx (layout wrappers), routes.ts (ROUTES const)
    ui/               — cross-cutting app-level UI (errorBoundary, etc.)
  pages/<name>/
    common/           — shared UI/logic between mobile and desktop variant
    desktop/Page<Name>Desktop.tsx
    mobile/Page<Name>Mobile.tsx
    index.ts          — exports both Page<Name>Desktop and Page<Name>Mobile
  features/<name>/    — same common/desktop/mobile split as pages when a
                         feature has device-specific UI; root index.ts is the
                         only import surface for the rest of the app
  widgets/<name>/     — composed UI blocks made of features/shared
  shared/
    api/              — API client wiring
    lib/              — cross-cutting logic
    theme/            — MUI theme + light/dark mode
    types/            — shared TS types
    ui/               — generic presentational components
  assets/
```

**Mobile vs desktop is mandatory, not optional** — every page/feature with
UI ships both a desktop and mobile variant (identical data/logic in
`common/`, device-specific layout in `desktop/`/`mobile/`). Device choice
happens once at the top (`app/App.tsx`, `react-device-detect`'s `isMobile`),
never re-checked deeper in the tree.

`shared/` must never import from `app/pages/widgets/features` (enforced via
`biome.json` `noRestrictedImports`). Features/pages only expose their root
barrel — never import a submodule path like `@web/features/foo/mobile/*`
directly.

## React Native Readiness

A React Native app is a likely future target. This does not mean building
one now — it means the `common/` layer of every page/feature must already be
written so it could be reused by an RN app later without a rewrite:

- **`common/` holds no MUI/DOM-specific code.** Business logic, data
  fetching hooks, derived state, and prop/type contracts for a UI piece live
  in `common/` and must not import `@mui/*`, `react-router`'s DOM APIs, or
  anything web-only.
- **Presentational components split by platform even within `common/`
  when needed**: a shared piece of UI logic (e.g. "what fields does a
  RegionCard show, in what order") is expressed as a plain data-shaping
  function or hook in `common/`, consumed by a `desktop/`/`mobile/`
  MUI component now, and by an RN component later — the shaping logic isn't
  duplicated, only the render layer is.
- **No inline styling logic mixed into data logic.** Keep "what to render"
  (hooks, derived values) separate from "how it looks" (`styled()`
  components) so the former ports to RN and the latter is rewritten once,
  intentionally, not accidentally dragged along.
- When building a new page/feature, ask: *if this had to render in React
  Native tomorrow, what part of `common/` would I have to touch?* If the
  answer is "the MUI components," that's fine — those are expected to be
  rewritten. If the answer includes hooks or type contracts, they're in the
  wrong layer.

## Backend Structure (module-per-feature)

`apps/api` — NestJS, in this same repo. Keep it simple for a solo/open-source
project until there's a reason to split into a separate backend repo.

```
apps/api/src/
  <feature>/            — e.g. routes/, crags/, photos/
    <feature>.module.ts
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.types.ts
  common/
    exceptions/
    filters/            — e.g. http-exception.filter.ts
    guards/
    utils/
  config/               — env/config loaders, e.g. supabase.config.ts
  health/
  app.module.ts
  main.ts
```

New backend features are Nest modules under `src/<feature>/`, registered in
`app.module.ts`.

Contracts flow one way: backend generates its OpenAPI/contract spec →
`packages/api` generates typed client from it. Never hand-edit
`packages/api/src/generated/` — change the contract in `apps/api` and
regenerate.

## Code Quality

- **No over-engineering** — implement exactly what was asked. No abstractions
  for hypothetical future use, no patterns where plain code works.
- **Clarify before assuming** — if requirements are unclear, ask. Don't guess.
- **Minimal comments** — comment only when critically necessary: a non-obvious
  footgun, a workaround with a reason, or intent the code can't express. No
  comments that restate what the code already says.
- Open source means code quality is also documentation: prefer clear names and
  small functions over comments explaining unclear ones.

## Security

- Every Supabase mutation must validate ownership (`id_user`/RLS) — never
  trust client-supplied IDs without server-side verification.
- No `dangerouslySetInnerHTML`. User input reaching the DOM must be sanitized.
- Supabase queries use parameterized SDK methods only — no string
  concatenation in filters.
- No secrets, API keys, or tokens in client-side code or committed files.

## Import Order

Auto-sorted by Biome (`organizeImports`) — on save and via `pnpm lint:fix`.
Never hand-fix order.

## Import Paths

Max two levels up (`../../x`). Deeper → use the `@web/*` alias.

## ID Naming

**`id` always comes first — a trailing `Id`/`_id` is never allowed.**

- DB (snake_case): `id_user`, `id_route`, `id_crag` — never `user_id`.
- API payloads, DTOs, route params, JS/TS (camelCase): `idUser`, `idRoute`,
  `idCrag` — never `userId`, `routeId`.
- Applies to every layer and every artifact: Supabase columns, NestJS DTOs and
  `@Param()` names, URL path params (`/regions/:idRegion`), React state, hook
  arguments, test fixtures, JSON fixtures, docs.
- The only exception is a bare `id` (a resource's own identifier) and
  third-party names we don't own (`getElementById`, OpenAPI's `operationId`).

## Folder Naming

All folders — camelCase. React components PascalCase, hooks `useX.ts`.

## i18n Rules

- Never hardcode UI copy — always `t\`...\`` (Lingui macro) or `<Trans>`.
- Source strings are written in English, extracted via `lingui extract`,
  translated in `src/locales/{en,uk}/messages.po`.
- Route/crag/route names (real-world proper nouns) are data, not translated —
  only UI chrome and generated labels go through i18n.

## Theming

- Single MUI theme source in `apps/web/src/shared/theme`, light + dark mode,
  switch persisted client-side.
- No inline hex colors in components — always theme tokens.
- **No `sx` prop anywhere.** Style through `styled()` template-literal form
  (`styled(Component)\`...\``, not the object/callback form) from
  `@mui/material/styles`, declared below the component in the same file.
  Naming: `<Name>Styled` suffix (e.g. `TitleStyled`), never a bare name or
  a prefix. See `.claude/rules/components.md` for the full rule.

## Tests

- Co-located `Component.spec.tsx`. Vitest + `@testing-library/react`.

## Workflow

- Always show git diff before committing.
- Split into logical units, wait for approval.
- **Atomic commits** — one logical change. Before commit: `lint:fix`.
- **Commit message** — `type(scope): imperative summary`. ~50–72 chars, no
  period, English.
- **CI gates** — `format:check` + `pnpm test` + `build:web` must pass before
  merge.
