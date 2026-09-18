import { useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { buildRegionPath } from '@web/app/router/routes';
import { ApiFeedback } from '@web/shared/ui';

import {
  HomeHeading,
  HomeThemeToggle,
  RegionsGrid,
  useApiGetRegions
} from '../common';

export const PageHomeDesktop = () => {
  const navigate = useNavigate();
  const { regions, isLoading, failure } = useApiGetRegions();

  return (
    <PageStyled spacing={3}>
      <HomeHeading />
      <HomeThemeToggle />
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading regions…</Trans>}
      />
      <RegionsGrid
        regions={regions}
        onSelect={(region) =>
          navigate(buildRegionPath(region.id), { state: { name: region.name } })
        }
      />
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
