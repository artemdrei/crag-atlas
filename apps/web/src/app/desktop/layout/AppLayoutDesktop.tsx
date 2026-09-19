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

const LayoutRootStyled = styled(Box)`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainStyled = styled(Box)`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
` as typeof Box;
