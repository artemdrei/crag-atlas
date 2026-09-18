# Domain model (draft)

Not finalized — schema TBD.

## Core entities (MVP)

- `crag` — a climbing area/region (e.g. Поділля, Бивце). Has name, region,
  geo-coordinates.
- `sector` — belongs to a `crag`.
- `route` — belongs to a `sector`. Name, grade, grade system (french/YDS/UIAA
  — kept explicit, not baked into the grade string), length.
- `route_photo` — belongs to a `route`. Image + topo line overlay (stored as
  path/polygon coordinates over the image).

## Deferred (post-MVP)

- User accounts, comments, likes, ascent logging.
- Import/integration with external route databases (e.g. 8a.nu, Vertical-Life)
  — no public API available; would require manual export or scraping. Grade
  system field above exists specifically so this doesn't require a schema
  change later.
