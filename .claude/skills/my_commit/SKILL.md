---
name: my_commit
description: 'Use when: ready to commit. Runs lint:fix, stages files, creates conventional commit.'
argument-hint: 'optional: files or directories to stage (default: all changed)'
---

# Conventional Commit

## Workflow

### 1. Assess changes

```bash
git status --short
git diff --stat
```

Identify logical scope of changes. If changes span unrelated concerns — split into separate commits.

### 2. Fix lint and format

```bash
pnpm lint:fix   # biome check --write (format + lint + imports)
pnpm test
```

Skip if only `.claude/`, `CLAUDE.md`, config files, or non-JS/TS files changed.

### 3. Stage files

If `$ARGUMENTS` provided — stage those paths only.
Otherwise stage all tracked modified files (do NOT use `git add -A` blindly — check for unintended files first).

```bash
git add <files>
git diff --cached --stat   # confirm what's staged
```

### 4. Determine commit message

**Format:** `type(scope): imperative summary`

- Max 72 chars, no period, English
- Imperative mood: "add", "fix", "remove", "update", "refactor" — not "added", "fixes"

**Types:**
| type | when |
|------|------|
| `feat` | new user-facing feature |
| `fix` | bug fix |
| `refactor` | restructuring without behavior change |
| `chore` | tooling, deps, config, scripts |
| `docs` | documentation only |
| `test` | adding or fixing tests |
| `perf` | performance improvement |
| `style` | formatting only (no logic change) |

**Scope** — where the change was made:

- `web` — apps/web
- `api` — apps/api
- `web,api` — multiple locations, comma-separated
- omit only for repo-wide tooling (turbo config, root package.json)

**Examples:**

```
feat(web): add region picker page
fix(api): handle missing id_route in sector query
refactor(web): extract topo overlay into shared component
chore: update turbo config with new task
```

### 5. Commit

```bash
git commit -m "$(cat <<'EOF'
type(scope): summary

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

### 6. Report

Show: commit hash + message + files changed.
If pre-commit hook fails — fix the issue, re-stage, create a NEW commit (never `--amend` after hook failure).
