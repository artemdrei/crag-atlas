import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useLingui } from '@lingui/react/macro';
import { useTheme } from '@mui/material/styles';

import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import { CatalogSearchMobile } from '@web/features/catalogSearch';
import {
  mapSectors,
  SectorMapMobile,
  sectorPinColors
} from '@web/features/sectorMap';
import {
  ApiFeedback,
  PageBreadcrumbs,
  PageShell,
  PageTitle
} from '@web/shared/ui';

import {
  ArchivedRegionNotice,
  SectorCard,
  SectorsList,
  useApiGetRegion,
  useApiGetSectors,
  useApiGetTickedSectors
} from '../common';

export const PageRegionMobile = () => {
  const { t } = useLingui();
  const { idRegion = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { region, failure: regionFailure } = useApiGetRegion(idRegion);
  const { sectors, isLoading, failure } = useApiGetSectors(idRegion);
  const { tickedOf } = useApiGetTickedSectors(idRegion);
  const mapped = useMemo(() => mapSectors(sectors), [sectors]);
  const pinColors = useMemo(
    () => sectorPinColors(mapped, theme.palette.sectorPin),
    [mapped, theme.palette.sectorPin]
  );

  return (
    <PageShell spacing={2} isCompact>
      <PageBreadcrumbs
        maxItems={2}
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: region?.name ?? '…' }
        ]}
      />
      {region?.isArchived && <ArchivedRegionNotice />}
      <PageTitle
        name={region?.name}
        nameLocal={region?.nameLocal}
        variant="h5"
      />
      <CatalogSearchMobile />
      <ApiFeedback failure={regionFailure ?? failure} />
      <SectorMapMobile
        mapped={mapped}
        renderSector={(sector) => (
          <SectorCard
            sector={sector}
            pinColor={pinColors[sector.id]}
            onSelect={() => navigate(buildSectorPath(idRegion, sector.id))}
          />
        )}
        onOpenSector={(idSector) =>
          navigate(buildSectorPath(idRegion, idSector))
        }
      />
      <SectorsList
        sectors={sectors}
        pinColors={pinColors}
        tickedOf={tickedOf}
        isLoading={isLoading}
        onSelect={(sector) => navigate(buildSectorPath(idRegion, sector.id))}
      />
    </PageShell>
  );
};
