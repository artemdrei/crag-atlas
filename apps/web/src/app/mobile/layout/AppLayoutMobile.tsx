import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';

import Box from '@mui/material/Box';
import { keyframes, styled } from '@mui/material/styles';

import { ErrorBoundary } from '@web/app/ui/errorBoundary';
import { useScrollRestoration } from '@web/shared/lib';
import { OfflineBanner } from '@web/shared/ui';

import { AppBottomNavigation } from './AppBottomNavigation';
import { HeaderMobile } from './HeaderMobile';

export const AppLayoutMobile = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const mainRef = useRef<HTMLDivElement>(null);
  // The first screen also arrives as POP; only a POP after another screen
  // is the climber going back.
  const hasNavigated = useRef(false);
  const isBack = navigationType === 'POP' && hasNavigated.current;

  useEffect(() => {
    hasNavigated.current = true;
  }, []);

  useScrollRestoration(mainRef);

  return (
    <LayoutRootStyled>
      <HeaderSlotStyled>
        <HeaderMobile />
        <OfflineBanner />
      </HeaderSlotStyled>
      <MainStyled ref={mainRef} component="main">
        {/* Keyed by path: a crash on one screen must not follow the user to
            the next one, and a boundary only clears by remounting. */}
        <ErrorBoundary key={location.pathname}>
          <PageFadeStyled isAnimated={!isBack}>
            <Outlet />
          </PageFadeStyled>
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
  /* iOS ignores user-scalable=no; this is what stops its page pinch-zoom. */
  touch-action: pan-x pan-y;
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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const PageFadeStyled = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAnimated'
})<{ isAnimated: boolean }>`
  animation: ${({ isAnimated }) => (isAnimated ? fadeIn : 'none')} 0.2s
    ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const NavSlotStyled = styled(Box)`
  flex-shrink: 0;
`;
