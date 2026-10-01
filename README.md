# crag-atlas

Open-source platform for discovering climbing routes: crags → sectors →
routes → photos with topo lines.

## Status

Early scaffold — no working features yet.

## Stack

- Turborepo + pnpm workspaces
- `apps/web` — React + TypeScript + Vite + MUI
- `apps/api` — NestJS
- Supabase (PostgreSQL)
- i18n: Lingui (`en`, `uk`)

## Development

```bash
pnpm install
pnpm dev        # web + api together
# or separately:
pnpm dev:web
pnpm dev:api
```

## Data

Ascent conditions come from [Open-Meteo](https://open-meteo.com), used under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The free tier is
non-commercial.

## License

MIT — see [LICENSE](./LICENSE).
