import type { CatalogSearch, SearchHit } from '@crag-atlas/api';

export type SearchGroup = 'regions' | 'sectors' | 'routes';

export interface SearchOption {
  hit: SearchHit;
  group: SearchGroup;
}

// Autocomplete groups consecutive options, so the order here is the order the
// groups appear in.
export const toSearchOptions = ({
  regions,
  sectors,
  routes
}: CatalogSearch): SearchOption[] => [
  ...regions.map((hit) => ({ hit, group: 'regions' as const })),
  ...sectors.map((hit) => ({ hit, group: 'sectors' as const })),
  ...routes.map((hit) => ({ hit, group: 'routes' as const }))
];
