import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { PageHomeDesktop } from '@web/pages/home';
import { PageLogbookDesktop } from '@web/pages/logbook';
import { PageLoginDesktop } from '@web/pages/login';
import { PageProfileDesktop } from '@web/pages/profile';
import { PageRegionDesktop } from '@web/pages/region';
import { PageRouteDesktop } from '@web/pages/route';
import { PageSectorDesktop } from '@web/pages/sector';

import { LayoutWithSidebar, ProtectedRoute } from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

// Dev-only: the ternary folds to null in a production build, so Rollup drops
// the dynamic import and the playground never ships.
const PagePlaygroundDesktop = import.meta.env.DEV
  ? lazy(() =>
      import('@web/pages/playground').then((module) => ({
        default: module.PagePlaygroundDesktop
      }))
    )
  : null;

const AppDesktop = () => (
  <ErrorBoundary>
    <Suspense>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<PageLoginDesktop />} />
        <Route element={<LayoutWithSidebar />}>
          <Route path={ROUTES.INDEX} element={<PageHomeDesktop />} />
          <Route path={ROUTES.REGION} element={<PageRegionDesktop />} />
          <Route path={ROUTES.SECTOR} element={<PageSectorDesktop />} />
          <Route path={ROUTES.ROUTE_DETAIL} element={<PageRouteDesktop />} />
          {PagePlaygroundDesktop && (
            <Route
              path={ROUTES.PLAYGROUND}
              element={<PagePlaygroundDesktop />}
            />
          )}
          <Route
            path={ROUTES.LOGBOOK}
            element={
              <ProtectedRoute requiredRole="user">
                <PageLogbookDesktop />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute requiredRole="user">
                <PageProfileDesktop />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppDesktop;
