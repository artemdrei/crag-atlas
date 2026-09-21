import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { PageHomeMobile } from '@web/pages/home';
import { PageLogbookMobile } from '@web/pages/logbook';
import { PageLoginMobile } from '@web/pages/login';
import { PageProfileMobile } from '@web/pages/profile';
import { PageRegionMobile } from '@web/pages/region';
import { PageRouteMobile } from '@web/pages/route';
import { PageSectorMobile } from '@web/pages/sector';
import { PageSectorEditMobile } from '@web/pages/sectorEdit';

import {
  LayoutWithMobileBottomNavigation,
  ProtectedRoute
} from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

// Dev-only: the ternary folds to null in a production build, so Rollup drops
// the dynamic import and the playground never ships.
const PagePlaygroundMobile = import.meta.env.DEV
  ? lazy(() =>
      import('@web/pages/playground').then((module) => ({
        default: module.PagePlaygroundMobile
      }))
    )
  : null;

const AppMobile = () => (
  <ErrorBoundary>
    <Suspense>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<PageLoginMobile />} />
        <Route element={<LayoutWithMobileBottomNavigation />}>
          <Route path={ROUTES.INDEX} element={<PageHomeMobile />} />
          <Route path={ROUTES.REGION} element={<PageRegionMobile />} />
          <Route path={ROUTES.SECTOR} element={<PageSectorMobile />} />
          <Route path={ROUTES.ROUTE_DETAIL} element={<PageRouteMobile />} />
          <Route
            path={ROUTES.SECTOR_EDIT}
            element={
              <ProtectedRoute requiredRole="admin">
                <PageSectorEditMobile />
              </ProtectedRoute>
            }
          />
          {PagePlaygroundMobile && (
            <Route
              path={ROUTES.PLAYGROUND}
              element={<PagePlaygroundMobile />}
            />
          )}
          <Route
            path={ROUTES.LOGBOOK}
            element={
              <ProtectedRoute requiredRole="user">
                <PageLogbookMobile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute requiredRole="user">
                <PageProfileMobile />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppMobile;
