import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import {
  mapSectors,
  SectorMapMobile,
  sectorPinColors
} from '@web/features/sectorMap';
import { ApiFeedback, PageBreadcrumbs, PageShell } from '@web/shared/ui';

import {
  ArchivedRegionNotice,
  SectorCard,
  SectorsList,
  useApiGetRegion,
  useApiGetSectors
} from '../common';

export const PageRegionMobile = () => {
  const { t } = useLingui();
  const { idRegion = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { region, failure: regionFailure } = useApiGetRegion(idRegion);
  const { sectors, isLoading, failure } = useApiGetSectors(idRegion);
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
      <Typography variant="h5">{region?.name ?? '…'}</Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={regionFailure ?? failure}
        loadingLabel={<Trans>Loading sectors…</Trans>}
      />
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
        onSelect={(sector) => navigate(buildSectorPath(idRegion, sector.id))}
      />
    </PageShell>
  );
};
