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
- **No `sx` prop.** All styling goes through `styled()` from
  `@mui/material/styles`, one styled component per styled element.
- **Naming**: `<Name>Styled` — the plain name plus a `Styled` suffix
  (e.g. `TitleStyled`, `HeaderStyled`), never a bare `Styled` or a prefix.
- **Placement**: styled components are declared below the component that
  uses them, in the same file — never above, never in a separate file.
- **No inline hex colors** — always MUI theme tokens
  (`${({ theme }) => theme.palette.*}` inside the styled template).
- **No inline styles for layout that repeats** — extract to a shared
  component in `shared/ui` once the same layout pattern appears twice.
