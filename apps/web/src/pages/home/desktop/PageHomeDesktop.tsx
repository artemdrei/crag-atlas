import Stack from '@mui/material/Stack';

import { HomeHeading, HomeThemeToggle } from '../common';

export const PageHomeDesktop = () => (
  <Stack spacing={2} sx={{ p: 4 }}>
    <HomeHeading />
    <HomeThemeToggle />
  </Stack>
);
