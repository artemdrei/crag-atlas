import { Outlet } from 'react-router';

import Box from '@mui/material/Box';

import { AppHeaderDesktop } from './AppHeaderDesktop';

export const AppLayoutDesktop = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <AppHeaderDesktop />
    <Box component="main" sx={{ flexGrow: 1 }}>
      <Outlet />
    </Box>
  </Box>
);
