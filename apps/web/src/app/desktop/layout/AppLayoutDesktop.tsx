import { Outlet } from 'react-router';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { CONTENT_MAX_WIDTH } from '@web/shared/theme/layout';

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
  width: 100%;
  max-width: ${CONTENT_MAX_WIDTH}px;
  margin: 0 auto;
  min-height: 0;
  overflow-y: auto;
` as typeof Box;
