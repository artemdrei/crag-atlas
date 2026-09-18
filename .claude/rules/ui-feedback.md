---
paths:
  - 'apps/web/src/**'
---

# Toasts & Modals

## Toasts

- Single import point: `import { toast } from '@web/shared/lib'` — never
  import from `sonner` directly anywhere else. `AppToastProvider`
  (`app/providers/AppToastProvider.tsx`) mounts the one `<Toaster>`,
  theme-synced to `useThemeMode()`.
- Use for: mutation success/failure feedback, background-action results —
  not for inline page errors (that's `ApiFeedback` / `resolveFailureMessage`
  in the page body).
- **Reporter-driven toast (`app/setupReporter.ts`, called once in
  `main.tsx`)**: the shared `reporter` (`@crag-atlas/utils`) sink is wired
  here to `toast.error(...)`, but **only for `Failure.kind === 'unknown'`**
  — genuinely unexpected errors that have no dedicated UI anywhere.
  `domain`/`validation` failures are already surfaced inline (that's the
  whole point of `ApiFeedback`); toasting them too would just duplicate the
  message. `network` isn't reported at all (`wrapApiCall` already skips
  it). Don't add a second reporter sink elsewhere — one wiring point.
- When the first mutation exists (`useApi<Action><Resource>`), toast its
  success/failure explicitly at the call site
  (`toast.success(...)`/`toast.error(resolveFailureMessage(failure))`) —
  the reporter-driven toast above is a safety net for bugs, not a
  substitute for deliberate mutation feedback.

## Modals — registration-based, not ad-hoc `useState`

Mirrors the same mechanism regardless of how many modals exist yet:

- A feature that needs a modal declares its payload via declaration merging
  on `ModalPayloadMap` (`app/providers/modalProvider/types.ts`):
  ```ts
  declare module '@web/app/providers/modalProvider/types' {
    interface ModalPayloadMap {
      CREATE_ROUTE: { idSector: string };
    }
  }
  ```
- The feature exports a `<feature>ModalRegistrations: ModalRegistration[]`
  array (lazy-loaded component + its `ID_MODAL`).
- `AppProviders.tsx` aggregates every feature's registrations into one
  array passed to `ModalProvider`. Currently empty — no feature has a
  modal yet.
- Consumers call `useModal().openModal('CREATE_ROUTE', { idSector })` /
  `closeModal('CREATE_ROUTE')` — never render a modal component directly
  in a page body with local `useState`.
