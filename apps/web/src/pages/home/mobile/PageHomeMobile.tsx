import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import { CatalogSearchMobile } from '@web/features/catalogSearch';
import { mapRegions, RegionMapMobile } from '@web/features/regionMap';
import { ApiFeedback, PageShell } from '@web/shared/ui';

import { HomeHeading, RegionsGrid, useApiGetRegions } from '../common';

export const PageHomeMobile = () => {
  const openCatalogItem = useOpenCatalogItem();
  const { regions, isLoading, failure } = useApiGetRegions();

  return (
    <PageShell spacing={2} isCompact>
      <HomeHeading />
      <CatalogSearchMobile />
      <ApiFeedback failure={failure} />
      <RegionMapMobile
        mapped={mapRegions(regions)}
        onOpenRegion={(region) =>
          openCatalogItem('map', { name: region.name, idRegion: region.id })
        }
      />
      <RegionsGrid
        regions={regions}
        isLoading={isLoading}
        onSelect={(region) =>
          openCatalogItem('card', { name: region.name, idRegion: region.id })
        }
      />
    </PageShell>
  );
};
