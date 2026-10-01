import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { ErrorBoundary } from '@web/app/ui/errorBoundary';
import { useScrollTopOnNavigate } from '@web/shared/lib';

import { AppBottomNavigation } from './AppBottomNavigation';
import { HeaderMobile } from './HeaderMobile';

export const AppLayoutMobile = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useScrollTopOnNavigate(mainRef);

  return (
    <LayoutRootStyled>
      <HeaderSlotStyled>
        <HeaderMobile />
      </HeaderSlotStyled>
      <MainStyled ref={mainRef} component="main">
        {/* Keyed by path: a crash on one screen must not follow the user to
            the next one, and a boundary only clears by remounting. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </MainStyled>
      <NavSlotStyled>
        <AppBottomNavigation />
      </NavSlotStyled>
    </LayoutRootStyled>
  );
};

const LayoutRootStyled = styled(Box)`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderSlotStyled = styled(Box)`
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`;

const MainStyled = styled(Box)`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
` as typeof Box;

const NavSlotStyled = styled(Box)`
  flex-shrink: 0;
`;
