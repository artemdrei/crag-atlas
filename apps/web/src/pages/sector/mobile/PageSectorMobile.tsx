import { Link, useLocation, useParams } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback } from '@web/shared/ui';

import { RoutesList, useApiGetRoutes } from '../common';

export const PageSectorMobile = () => {
  const { regionId = '', sectorId = '' } = useParams();
  const location = useLocation();
  const sectorName = (location.state as { name?: string } | null)?.name;
  const { routes, isLoading, failure } = useApiGetRoutes(sectorId);

  return (
    <PageStyled spacing={2}>
      <Link to={`/regions/${regionId}`}>
        <Trans>Back to sectors</Trans>
      </Link>
      <Typography variant="h5">{sectorName ?? sectorId}</Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading routes…</Trans>}
      />
      <RoutesList routes={routes} />
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
