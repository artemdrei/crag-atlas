import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import { ApiFeedback, PageBreadcrumbs, PageShell } from '@web/shared/ui';

import { SectorsList, useApiGetRegion, useApiGetSectors } from '../common';

export const PageRegionMobile = () => {
  const { t } = useLingui();
  const { idRegion = '' } = useParams();
  const navigate = useNavigate();
  const { region } = useApiGetRegion(idRegion);
  const { sectors, isLoading, failure } = useApiGetSectors(idRegion);

  return (
    <PageShell spacing={2} isCompact>
      <PageBreadcrumbs
        maxItems={2}
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: region?.name ?? '…' }
        ]}
      />
      <Typography variant="h5">{region?.name ?? '…'}</Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading sectors…</Trans>}
      />
      <SectorsList
        sectors={sectors}
        onSelect={(sector) => navigate(buildSectorPath(idRegion, sector.id))}
      />
    </PageShell>
  );
};
