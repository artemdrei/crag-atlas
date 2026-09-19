import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { buildSectorPath, ROUTES } from '@web/app/router/routes';
import { ApiFeedback } from '@web/shared/ui';

import { SectorsList, useApiGetSectors } from '../common';

export const PageRegionMobile = () => {
  const { idRegion = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const regionName = (location.state as { name?: string } | null)?.name;
  const { sectors, isLoading, failure } = useApiGetSectors(idRegion);

  return (
    <PageStyled spacing={2}>
      <Link to={ROUTES.INDEX}>
        <Trans>Back to regions</Trans>
      </Link>
      <Typography variant="h5">{regionName ?? idRegion}</Typography>
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading sectors…</Trans>}
      />
      <SectorsList
        sectors={sectors}
        onSelect={(sector) =>
          navigate(buildSectorPath(idRegion, sector.id), {
            state: { name: sector.name }
          })
        }
      />
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(2)};
`;
