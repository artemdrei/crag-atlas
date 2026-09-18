import { Link, useParams } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { buildSectorPath } from '@web/app/router/routes';
import { ApiFeedback } from '@web/shared/ui';

import { RouteDetails, useApiGetRoute } from '../common';

export const PageRouteMobile = () => {
  const { regionId = '', sectorId = '', routeId = '' } = useParams();
  const { route, isLoading, failure } = useApiGetRoute(routeId);

  return (
    <PageStyled spacing={2}>
      <Link to={buildSectorPath(regionId, sectorId)}>
        <Trans>Back to routes</Trans>
      </Link>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading route…</Trans>}
      />
      {route && <RouteDetails route={route} />}
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
