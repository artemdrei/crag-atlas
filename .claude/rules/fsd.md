---
paths:
  - 'apps/web/src/features/**'
  - 'apps/web/src/widgets/**'
  - 'apps/web/src/pages/**'
  - 'apps/web/src/shared/**'
  - 'apps/web/src/app/**'
---

# Feature-Sliced Design (device-split)

## Shape — `apps/web/src/{pages,features}/<name>/`

```
<name>/
├── common/           # device-agnostic: entities/ hooks/ ui/ (whichever apply)
├── desktop/          # Page<X>Desktop.tsx or feature desktop UI at root
├── mobile/           # Page<X>Mobile.tsx or feature mobile UI at root
└── index.ts          # public API (explicit named re-exports)
```

**Mobile vs desktop split is mandatory** for anything with UI — see CLAUDE.md
"Frontend Structure". A slice with genuinely no device-specific layout may
skip `desktop/`/`mobile/` and keep everything in `common/`, but that's the
exception, not the default — confirm with the user before doing this.

## Rules

- No cross-feature imports. Shared code goes to `shared/*`. `biome.json`
  `noRestrictedImports` bans `@web/features/<other>/**` — top-level
  `@web/features/<other>` (the public API) is allowed when truly needed.
- Feature/page public API = root `index.ts` with **explicit named
  re-exports**. `export *` is fine inside `common/hooks` and
  `common/entities`, **not** in `ui/`.
- Hopping `common/ ↔ desktop|mobile/` uses `@web/features/<name>/...` or
  `@web/pages/<name>/...`; intra-layer stays relative.
- **Barrel imports**: when a layer has `index.ts`, always import through it
  (`from '../hooks'`), never directly from the source file
  (`from '../hooks/useFoo'`).
- **`ui/` grouping**:
  - **Flat file** (`ui/Foo.tsx`) when the component has no helper files.
  - **Folder** (`ui/foo/Foo.tsx` + `ui/foo/index.ts`) as soon as a second
    file appears. Internal files not exported — barrel exports only what's
    consumed outside the folder.
  - **Barrel** `ui/index.ts` — single explicit-named re-export per public
    component. **No `export *`** in `ui/`.
- **No sub-features inside `common/`** — logical grouping uses a filename
  prefix, not nested folders with their own `entities/hooks/ui/`.

## Layers

- `pages/*` — route-level surfaces (one per screen in `docs-private/roadmap.md`).
- `widgets/*` — composes **≥2** `features/*` into one surface. Features MUST
  NOT import from widgets. A pure re-export of one feature is **not** a
  widget.
- `shared/*` — device-agnostic infra (`api/ lib/ theme/ types/ ui/`). Must
  not import from `app/pages/widgets/features`. Biome `noRestrictedImports`
  enforces it.
- `app/*` — composition root (`App.tsx`, `providers/`, `router/`,
  `desktop/`, `mobile/`, `ui/`). No route pages or page-local UI here.

## Providers

Global providers at `apps/web/src/app/providers/`, composed in `App.tsx`.
When adding cross-cutting state, create a provider here.
