import { Outlet } from 'react-router';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { AppBottomNavigation } from './AppBottomNavigation';
import { HeaderMobile } from './HeaderMobile';

export const AppLayoutMobile = () => (
  <LayoutRootStyled>
    <HeaderSlotStyled>
      <HeaderMobile />
    </HeaderSlotStyled>
    <MainStyled component="main">
      <Outlet />
    </MainStyled>
    <NavSlotStyled>
      <AppBottomNavigation />
    </NavSlotStyled>
  </LayoutRootStyled>
);

const LayoutRootStyled = styled(Box)`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSlotStyled = styled(Box)`
  flex-shrink: 0;
`;

const MainStyled = styled(Box)`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
` as typeof Box;

const NavSlotStyled = styled(Box)`
  flex-shrink: 0;
`;
