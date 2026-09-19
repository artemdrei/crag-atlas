import { Link, useParams } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { buildSectorPath } from '@web/app/router/routes';
import { ApiFeedback } from '@web/shared/ui';

import { LogTickButton, RouteDetails, useApiGetRoute } from '../common';

export const PageRouteDesktop = () => {
  const { idRegion = '', idSector = '', idRoute = '' } = useParams();
  const { route, isLoading, failure } = useApiGetRoute(idRoute);

  return (
    <PageStyled spacing={3}>
      <Link to={buildSectorPath(idRegion, idSector)}>
        <Trans>Back to routes</Trans>
      </Link>
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
