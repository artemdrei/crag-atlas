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

const LayoutRootStyled = styled(Box)({
  height: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
});

const HeaderSlotStyled = styled(Box)({
  flexShrink: 0
});

const MainStyled = styled(Box)({
  flexGrow: 1,
  minHeight: 0,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch'
}) as typeof Box;

const NavSlotStyled = styled(Box)({
  flexShrink: 0
});
