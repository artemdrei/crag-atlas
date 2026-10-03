import { useMemo } from 'react';
import { useParams } from 'react-router';

import { useTheme } from '@mui/material/styles';

import { useOpenCatalogItem } from '@web/app/router/useOpenCatalogItem';
import { RegionConditionsMobile } from '@web/features/sectorConditions';
import {
  mapSectors,
  SectorMapMobile,
  sectorPinColors
} from '@web/features/sectorMap';
import { ApiFeedback, PageShell, PageTitle } from '@web/shared/ui';

import {
  ArchivedRegionNotice,
  SectorCard,
  SectorsList,
  useApiGetRegion,
  useApiGetSectors,
  useApiGetTickedSectors
} from '../common';

export const PageRegionMobile = () => {
  const { idRegion = '' } = useParams();
  const openCatalogItem = useOpenCatalogItem();
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
      {region?.isArchived && <ArchivedRegionNotice />}
      <PageTitle
        name={region?.name}
        nameLocal={region?.nameLocal}
        variant="h5"
      />
      <ApiFeedback failure={regionFailure ?? failure} />
      <SectorMapMobile
        mapped={mapped}
        renderSector={(sector) => (
          <SectorCard
            sector={sector}
            pinColor={pinColors[sector.id]}
            onSelect={() =>
              openCatalogItem('map', {
                name: sector.name,
                idRegion,
                idSector: sector.id
              })
            }
          />
        )}
        onOpenSector={(sector) =>
          openCatalogItem('map', {
            name: sector.name,
            idRegion,
            idSector: sector.id
          })
        }
      />
      <RegionConditionsMobile idRegion={idRegion} />
      <SectorsList
        sectors={sectors}
        pinColors={pinColors}
        tickedOf={tickedOf}
        isLoading={isLoading}
        onSelect={(sector) =>
          openCatalogItem('card', {
            name: sector.name,
            idRegion,
            idSector: sector.id
          })
        }
      />
    </PageShell>
  );
};
