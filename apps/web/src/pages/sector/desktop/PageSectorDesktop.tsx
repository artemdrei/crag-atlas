import { useNavigate, useParams } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  buildRegionPath,
  buildRoutePath,
  ROUTES
} from '@web/app/router/routes';
import { ApiFeedback, PageBreadcrumbs } from '@web/shared/ui';

import { RoutesList, useApiGetRoutes, useApiGetSector } from '../common';

export const PageSectorDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { sector } = useApiGetSector(idSector);
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);

  return (
    <PageStyled spacing={3}>
      <PageBreadcrumbs
        items={[
          { label: t`Regions`, to: ROUTES.INDEX },
          { label: sector?.regionName ?? '…', to: buildRegionPath(idRegion) },
          { label: sector?.name ?? '…' }
        ]}
      />
      <Typography variant="h4">{sector?.name ?? '…'}</Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading routes…</Trans>}
      />
      <RoutesList
        routes={routes}
        onSelect={(route) =>
          navigate(buildRoutePath(idRegion, idSector, route.id))
        }
      />
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
