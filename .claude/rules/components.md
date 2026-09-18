---
paths:
  - '**/*.tsx'
---

# React Components

- **Functional + named exports only**. No default exports (except lazy-loaded
  route entry points, which React requires to be default exports).
- **Props order**: short text → long text → booleans (`is*`/`has*`) →
  callbacks (`on*`). Within each group short → long.
- **Body order**: hooks → handlers → early returns → render.
- **Handler naming**: `handle*` inside component, `on*` in props interface.
- **Interface naming**:
  - Primary component → literally `Props`.
  - Secondary in same file → `<Name>Props`.
  - Hook params → `Params` (or `<HookName>Params`).
- **No inline hex colors** — always MUI theme tokens
  (`theme.palette.*`, `sx` prop referencing theme values).
- **No inline styles for layout that repeats** — extract to a shared
  component in `shared/ui` once the same layout pattern appears twice.
