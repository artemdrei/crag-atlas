import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { HomeHeading, HomeThemeToggle } from '../common';

export const PageHomeDesktop = () => (
  <PageStyled spacing={2}>
    <HomeHeading />
    <HomeThemeToggle />
  </PageStyled>
);

const PageStyled = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(4)
}));
