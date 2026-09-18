import { Outlet } from 'react-router';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { AppHeaderDesktop } from './AppHeaderDesktop';

export const AppLayoutDesktop = () => (
  <LayoutRootStyled>
    <AppHeaderDesktop />
    <MainStyled component="main">
      <Outlet />
    </MainStyled>
  </LayoutRootStyled>
);

const LayoutRootStyled = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
});

const MainStyled = styled(Box)({
  flexGrow: 1
}) as typeof Box;
