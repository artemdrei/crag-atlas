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

## Frontend Structure (FSD-lite, mirrors badNerd's apps/web)

```
apps/web/src/
  app/            — bootstrap: App.tsx, providers/, router/, ui/ (error boundaries etc.)
  pages/<name>/   — one folder per route, own index.ts barrel
  features/<name>/ — self-contained feature, communicates only via its root barrel
  widgets/<name>/ — composed UI blocks made of features/shared
  shared/
    api/          — API client wiring
    lib/          — cross-cutting logic (e.g. shared/lib/i18n)
    theme/        — MUI theme + light/dark mode
    types/        — shared TS types
    ui/           — generic presentational components
  assets/
```

`shared/` must never import from `app/pages/widgets/features` (enforced via
`biome.json` `noRestrictedImports`). Features only expose their root barrel.

## Backend Structure (module-per-feature, mirrors apiService)

`apps/api` — NestJS, in this same repo (unlike badNerd, no separate backend
repo — keep it simple for a solo/open-source project until there's a reason
to split).

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
`app.module.ts` — same shape as `apiService`'s users/decks/notes modules.

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

- Every Supabase mutation must validate ownership (`user_id`/RLS) — never
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

- DB / API (snake_case): `id_user`, `id_route`, `id_crag`.
- JS / TS (camelCase): `idUser`, `idRoute`, `idCrag`.

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
