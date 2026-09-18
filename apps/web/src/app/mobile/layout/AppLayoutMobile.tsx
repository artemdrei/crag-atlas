import { Outlet } from 'react-router';

import Box from '@mui/material/Box';

import { AppBottomNavigation } from './AppBottomNavigation';
import { HeaderMobile } from './HeaderMobile';

export const AppLayoutMobile = () => (
  <Box
    sx={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}
  >
    <Box sx={{ flexShrink: 0 }}>
      <HeaderMobile />
    </Box>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 0,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <Outlet />
    </Box>
    <Box sx={{ flexShrink: 0 }}>
      <AppBottomNavigation />
    </Box>
  </Box>
);
