import { useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import {
  buildRegionPath,
  buildSectorPath,
  ROUTES
} from '@web/app/router/routes';
import { ApiFeedback, PageBreadcrumbs } from '@web/shared/ui';

import { LogTickButton, RouteDetails, useApiGetRoute } from '../common';

export const PageRouteDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const { route, isLoading, failure } = useApiGetRoute(idRoute);

  return (
    <PageStyled spacing={3}>
      <PageBreadcrumbs
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: route?.regionName ?? '…', to: buildRegionPath(idRegion) },
          {
            label: route?.sectorName ?? '…',
            to: buildSectorPath(idRegion, idSector)
          },
          { label: route?.name ?? '…' }
        ]}
      />
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading route…</Trans>}
      />
      {route && (
        <>
          <RouteDetails route={route} />
          <LogTickButton idRoute={route.id} />
        </>
      )}
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
