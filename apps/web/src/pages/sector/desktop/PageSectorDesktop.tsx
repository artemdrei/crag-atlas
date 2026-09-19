import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildRoutePath } from '@web/app/router/routes';
import { ApiFeedback } from '@web/shared/ui';

import { RoutesList, useApiGetRoutes } from '../common';

export const PageSectorDesktop = () => {
  const { idRegion = '', idSector = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sectorName = (location.state as { name?: string } | null)?.name;
  const { routes, isLoading, failure } = useApiGetRoutes(idSector);

  return (
    <PageStyled spacing={3}>
      <Link to={`/regions/${idRegion}`}>
        <Trans>Back to sectors</Trans>
      </Link>
      <Typography variant="h4">{sectorName ?? idSector}</Typography>
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
