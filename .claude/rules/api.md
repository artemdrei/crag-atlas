---
paths:
  - 'apps/web/src/**/hooks/**'
  - 'apps/api/src/**'
---

# API & Error Handling

## Frontend hook naming

- Data-fetching hook: `useApiGet<Resource>.ts` (e.g. `useApiGetRegions.ts`),
  never a bare `use<Resource>`.
- Mutation hook: `useApi<Action><Resource>.ts` (e.g. `useApiCreateRoute.ts`).
- One file = one hook. Return an object (`{ data, isLoading, error }`),
  never a tuple.
- Calls go through `shared/api` (`apiGet`/future `apiPost` etc.) — never a
  raw `fetch()` in a hook.
- **Async control flow**: `useEffect` can't take an `async` callback
  directly, so declare an inner `async` function and call it immediately
  inside the effect. Use `try/catch/finally` inside that function — never
  `.then()/.catch()/.finally()` chains. Keep the `cancelled` flag pattern
  for avoiding state updates after unmount.

## Backend error model

- Domain/expected errors throw `AppException` (or a subclass) from
  `apps/api/src/common/exceptions/app.exception.ts` — never a bare
  `throw new Error(...)` for anything the client needs to interpret.
- `AppException` carries `message`, `statusCode`, `code?`, `data?`.
- `GlobalHttpExceptionFilter` (`common/filters/http-exception.filter.ts`) is
  the single place that turns any thrown value into the response envelope:
  `{ success: false, message, code?, data? }`. Never hand-roll an error
  response in a controller.
- 5xx logs at `error` level, 4xx at `warn` — set in the filter, not per
  controller.

## Frontend error handling — `Failure`

Every thrown error a hook sees is a `Failure` (`@crag-atlas/utils`), never a
bare `Error`/`ApiError`/whatever a library happened to throw. No third shape.

- `Failure` is a discriminated union: `kind: 'network' | 'validation' |
  'domain' | 'unknown'`, plus `message`, `code?`/`field?`/`meta?` depending
  on kind.
- `apiGet` (`shared/api/httpClient.ts`) is wrapped in `wrapApiCall` — this
  is the **one** place that normalizes whatever went wrong (bad HTTP
  status, network failure, anything else) into a `Failure` and reports
  non-network ones via `reporter.error`. Never re-implement this
  try/catch/normalize dance per hook or per feature.
- A hook's `catch` block just does `setFailure(toFailure(err))` —
  `toFailure` is idempotent, safe to call on something that's already a
  `Failure`.
- Never build a user-facing message by hand from `failure.message` for
  `network`/`unknown` kinds — call `resolveFailureMessage(failure)`, which
  gives a generic fallback for those two and the real message otherwise.
- `toFailure` already recognizes a Postgrest/Supabase error shape
  (`code`, `message`, `details`, `hint`) — this is not wired to any call
  site yet (still JSON-backed), but is there so switching a service to a
  real Supabase query doesn't require touching the error model.
- `reporter` (`@crag-atlas/utils`) is a swappable no-op sink
  (`setReporterSink`). Wiring a real monitoring tool later means calling
  `setReporterSink(...)` once at app bootstrap — no call site changes.

## Contract-first types — no hand-written duplicates

- Every DTO in `apps/api/src/<feature>/<feature>.types.ts` is a **class**
  with `@ApiProperty()` on each field (not a plain interface) — NestJS's
  Swagger reflection needs a real class to read.
- After adding/changing a DTO: run `pnpm gen:contracts` (backend emits
  `apps/api/openapi.json`) then `pnpm gen:api` (`packages/api` generates
  `src/generated/api-types.ts`) **before** using the type on the frontend.
- Frontend never hand-writes a type that mirrors a DTO. A page's
  `common/entities/<Name>.ts` re-exports the generated type from
  `@crag-atlas/api` (e.g. `export type { Region } from '@crag-atlas/api';`)
  — it does not redeclare the fields.
- `packages/api/src/index.ts` adds one alias export per resource
  (`export type Region = components['schemas']['RegionDto'];`) so
  consumers never touch the raw `components['schemas'][...]` path.
