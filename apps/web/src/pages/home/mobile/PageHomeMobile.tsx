import Stack from '@mui/material/Stack';

import { HomeHeading, HomeThemeToggle } from '../common';

export const PageHomeMobile = () => (
  <Stack spacing={2} sx={{ p: 2 }}>
    <HomeHeading />
    <HomeThemeToggle />
  </Stack>
);
