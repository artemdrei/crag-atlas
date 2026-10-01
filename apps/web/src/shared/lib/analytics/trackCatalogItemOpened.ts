import type { CatalogSource, EntityType } from '@crag-atlas/analytics';
import { track } from '@crag-atlas/analytics';

export interface Params {
  name: string;
  source: CatalogSource;
  idRegion: string;
  idSector?: string | null;
  idRoute?: string | null;
}

const entityTypeOf = ({ idSector, idRoute }: Params): EntityType => {
  if (idRoute) return 'route';
  if (idSector) return 'sector';

  return 'region';
};

export const trackCatalogItemOpened = (params: Params) => {
  const { name, source, idRegion, idSector, idRoute } = params;

  track({
    name: 'Catalog Item Opened',
    props: {
      entity_type: entityTypeOf(params),
      entity_name: name,
      source,
      id_region: idRegion,
      ...(idSector ? { id_sector: idSector } : {}),
      ...(idRoute ? { id_route: idRoute } : {})
    }
  });
};
