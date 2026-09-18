import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { HomeHeading, HomeThemeToggle, RegionsGrid } from '../common';
import { mockRegions } from '../common/mockRegions';

export const PageHomeDesktop = () => (
  <PageStyled spacing={3}>
    <HomeHeading />
    <HomeThemeToggle />
    <RegionsGrid regions={mockRegions} onSelect={() => {}} />
  </PageStyled>
);

const PageStyled = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(4)};
`;
