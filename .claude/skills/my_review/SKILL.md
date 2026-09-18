---
name: my_review
description: 'Use when: code was written or changed and needs quality check — conventions, patterns, security, AI slop'
argument-hint: '[file path] [security]'
---

# Review & fix code

## Trigger

Code has been written or changed and needs a quality check before commit.

## Arguments

- `$ARGUMENTS` — optional file path. If omitted, review all changed files from `git diff --name-only` and `git diff --cached --name-only`.
- `security` keyword in `$ARGUMENTS` — enables Security (check 8) + Pressure Testing (check 9). Default: off.

## Workflow

1. Get changed files: `git diff --name-only` + `git diff --cached --name-only`.
2. If `$ARGUMENTS` contains a file path, review only that file.
3. Read each file and check against ALL rules below.
4. **Fix issues directly** — don't just report, apply the fix.
5. Report a summary of what was fixed.

## Checks

### 1. Import Order

Auto-sorted by Biome `organizeImports` (on save / `pnpm lint:fix`) — **don't hand-fix order**, just run `pnpm lint:fix`. Groups (blank line between): `react` → Node builtins → `@web/*` → other external → relative. Within a group: alphabetical.

### 2. React Components

- Functional components, named exports
- Props interface named `Props`
- Props order: short text → long text → booleans → callbacks
- Structure: hooks → handlers → early returns → render
- Callbacks in props: `on*` prefix

### 3. Hooks

- One file = one hook
- Return object, not tuple
- Invalidate query cache on mutation success (once react-query is introduced)

### 4. FSD Architecture

- No cross-feature imports (`../../otherFeature/...` = violation)
- Barrel exports (`index.ts`) at each layer
- Every page/feature with UI ships both `desktop/` and `mobile/` variants, common logic in `common/`
- `shared/` never imports from `app/pages/widgets/features`

### 5. TypeScript

- No `any` — use `unknown` or proper generics
- `interface` over `type` for objects
- Optional properties instead of `| undefined`

### 6. i18n

- No hardcoded UI copy — must go through `t()`/`<Trans>` (Lingui)

### 7. AI Slop Removal

- Remove redundant comments that restate code
- Remove unnecessary `try/catch` on trusted internal calls
- Remove null checks for TS-guaranteed values
- Remove `any` casts — fix the actual type
- Remove unused imports, variables, parameters
- Remove `console.log` left from debugging
- Simplify deep nesting with early returns
- Remove single-use helper functions
- **If unsure whether it's slop — it probably is. Remove it.**

### 8. Security _(only when `security` in `$ARGUMENTS`)_

For each changed file that touches user input, auth, or DB queries:

**Supabase / DB:**

- Any SQL injection vectors? (params passed directly into query?)
- Row Level Security (RLS) or ownership check in place before query?

**User Input:**

- XSS possible? (`dangerouslySetInnerHTML`, etc.)
- Unsanitized input reaching DOM or query?

**Auth:**

- Mutation checks permissions before executing?
- Protection against unauthorized access if an id is tampered with client-side?

**API calls:**

- Errors handled or silently swallowed?
- `null`/empty response from Supabase checked?

### 9. Pressure Testing _(only when `security` in `$ARGUMENTS`)_

For each changed function/component, ask:

**Data edge cases:**

- What if empty input? `null`? `undefined`? Empty array `[]`?

**Components:**

- What if `isLoading`? What renders?
- What if no data? Is there an empty state?
- What if data is unexpectedly large?

## Output

```
## Review: [N files checked]

### Fixed
- file.tsx:45 — removed redundant comment
- file.tsx:78 — replaced `any` with proper type

### Warnings (manual review needed)
- file.tsx:90 — cross-feature import detected

### Clean
- file2.tsx — no issues
```
