import { useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { ErrorBoundary } from '@web/app/ui/errorBoundary';
import { useScrollTopOnNavigate } from '@web/shared/lib';
import { CONTENT_MAX_WIDTH } from '@web/shared/theme/layout';

import { AppHeaderDesktop } from './AppHeaderDesktop';

export const AppLayoutDesktop = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useScrollTopOnNavigate(mainRef);

  return (
    <LayoutRootStyled>
      <AppHeaderDesktop />
      <MainStyled ref={mainRef} component="main">
        {/* Keyed by path: a crash on one screen must not follow the user to
            the next one, and a boundary only clears by remounting. */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </MainStyled>
    </LayoutRootStyled>
  );
};

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
