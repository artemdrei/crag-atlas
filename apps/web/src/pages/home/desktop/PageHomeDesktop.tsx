import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import {
  HomeHeading,
  HomeThemeToggle,
  RegionsGrid,
  useApiGetRegions
} from '../common';

export const PageHomeDesktop = () => {
  const { regions } = useApiGetRegions();

  return (
    <PageStyled spacing={3}>
      <HomeHeading />
      <HomeThemeToggle />
      <RegionsGrid regions={regions} onSelect={() => {}} />
    </PageStyled>
  );
};

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
