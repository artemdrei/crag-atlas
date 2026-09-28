import { useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';

import { buildRegionPath } from '@web/app/router/routes';
import { CatalogSearchMobile } from '@web/features/catalogSearch';
import { mapRegions, RegionMapMobile } from '@web/features/regionMap';
import { ApiFeedback, PageShell } from '@web/shared/ui';

import { HomeHeading, RegionsGrid, useApiGetRegions } from '../common';

export const PageHomeMobile = () => {
  const navigate = useNavigate();
  const { regions, isLoading, failure } = useApiGetRegions();

  return (
    <PageShell spacing={2} isCompact>
      <HomeHeading />
      <CatalogSearchMobile />
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading regions…</Trans>}
      />
      <RegionMapMobile
        mapped={mapRegions(regions)}
        onOpenRegion={(idRegion) => navigate(buildRegionPath(idRegion))}
      />
      <RegionsGrid
        regions={regions}
        onSelect={(region) => navigate(buildRegionPath(region.id))}
      />
    </PageShell>
  );
};
