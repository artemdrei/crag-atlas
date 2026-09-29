import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { ModalProvider } from '@web/app/providers';
import { avatarUploadMobileRegistrations } from '@web/features/avatarUpload';
import { logTickMobileRegistrations } from '@web/features/logTick';
import { routeCommentMobileRegistrations } from '@web/features/routeComment';
import { topoMobileRegistrations } from '@web/features/topo';
import { playgroundMobileRegistrations } from '@web/pages/playground/registrations';
import { ProfileSkeleton } from '@web/pages/profile/common';
import { routeMediaMobileRegistrations } from '@web/widgets/routeMedia';

import { lazyPage as page } from '../router/lazyPage';
import {
  GuestOnlyRoute,
  LayoutWithMobileBottomNavigation,
  ProtectedRoute
} from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

// Below the device split on purpose: above it, the root bundle carries both
// devices' features.
const registrations = [
  ...avatarUploadMobileRegistrations,
  ...logTickMobileRegistrations,
  ...topoMobileRegistrations,
  ...routeCommentMobileRegistrations,
  ...routeMediaMobileRegistrations,
  ...playgroundMobileRegistrations
];

const PageHomeMobile = page(() => import('@web/pages/home'), 'PageHomeMobile');
const PageLogbookMobile = page(
  () => import('@web/pages/logbook'),
  'PageLogbookMobile'
);
const PageLoginMobile = page(
  () => import('@web/pages/login'),
  'PageLoginMobile'
);
const PageProfileMobile = page(
  () => import('@web/pages/profile'),
  'PageProfileMobile'
);
const PageRegionMobile = page(
  () => import('@web/pages/region'),
  'PageRegionMobile'
);
const PageRouteMobile = page(
  () => import('@web/pages/route'),
  'PageRouteMobile'
);
const PageSectorMobile = page(
  () => import('@web/pages/sector'),
  'PageSectorMobile'
);

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
    <ModalProvider registrations={registrations}>
      <Suspense>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <GuestOnlyRoute>
                <PageLoginMobile />
              </GuestOnlyRoute>
            }
          />
          <Route element={<LayoutWithMobileBottomNavigation />}>
            <Route path={ROUTES.INDEX} element={<PageHomeMobile />} />
            <Route path={ROUTES.REGION} element={<PageRegionMobile />} />
            <Route path={ROUTES.SECTOR} element={<PageSectorMobile />} />
            <Route path={ROUTES.ROUTE_DETAIL} element={<PageRouteMobile />} />
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
                <ProtectedRoute
                  requiredRole="user"
                  skeleton={<ProfileSkeleton />}
                >
                  <PageProfileMobile />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.INDEX} replace />} />
        </Routes>
      </Suspense>
    </ModalProvider>
  </ErrorBoundary>
);

export default AppMobile;
