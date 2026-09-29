import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { ModalProvider } from '@web/app/providers';
import { avatarUploadDesktopRegistrations } from '@web/features/avatarUpload';
import { catalogEditDesktopRegistrations } from '@web/features/catalogEdit';
import { logTickDesktopRegistrations } from '@web/features/logTick';
import { photoUploadDesktopRegistrations } from '@web/features/photoUpload';
import { routeCommentDesktopRegistrations } from '@web/features/routeComment';
import { topoDesktopRegistrations } from '@web/features/topo';
import { topoEditorDesktopRegistrations } from '@web/features/topoEditor';
import { playgroundDesktopRegistrations } from '@web/pages/playground/registrations';
import { ProfileSkeleton } from '@web/pages/profile/common';
import { routeMediaDesktopRegistrations } from '@web/widgets/routeMedia';

import { lazyPage as page } from '../router/lazyPage';
import {
  GuestOnlyRoute,
  LayoutWithSidebar,
  ProtectedRoute
} from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

// Below the device split on purpose: above it, the root bundle carries both
// devices' features.
const registrations = [
  ...avatarUploadDesktopRegistrations,
  ...catalogEditDesktopRegistrations,
  ...logTickDesktopRegistrations,
  ...topoDesktopRegistrations,
  ...topoEditorDesktopRegistrations,
  ...photoUploadDesktopRegistrations,
  ...routeCommentDesktopRegistrations,
  ...routeMediaDesktopRegistrations,
  ...playgroundDesktopRegistrations
];

const PageHomeDesktop = page(
  () => import('@web/pages/home'),
  'PageHomeDesktop'
);
const PageLogbookDesktop = page(
  () => import('@web/pages/logbook'),
  'PageLogbookDesktop'
);
const PageLoginDesktop = page(
  () => import('@web/pages/login'),
  'PageLoginDesktop'
);
const PageProfileDesktop = page(
  () => import('@web/pages/profile'),
  'PageProfileDesktop'
);
const PageRegionDesktop = page(
  () => import('@web/pages/region'),
  'PageRegionDesktop'
);
const PageRouteDesktop = page(
  () => import('@web/pages/route'),
  'PageRouteDesktop'
);
const PageRouteEditDesktop = page(
  () => import('@web/pages/routeEdit'),
  'PageRouteEditDesktop'
);
const PageSectorDesktop = page(
  () => import('@web/pages/sector'),
  'PageSectorDesktop'
);
const PageSectorEditDesktop = page(
  () => import('@web/pages/sectorEdit'),
  'PageSectorEditDesktop'
);

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
    <ModalProvider registrations={registrations}>
      <Suspense>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <GuestOnlyRoute>
                <PageLoginDesktop />
              </GuestOnlyRoute>
            }
          />
          <Route element={<LayoutWithSidebar />}>
            <Route path={ROUTES.INDEX} element={<PageHomeDesktop />} />
            <Route path={ROUTES.REGION} element={<PageRegionDesktop />} />
            <Route path={ROUTES.SECTOR} element={<PageSectorDesktop />} />
            <Route path={ROUTES.ROUTE_DETAIL} element={<PageRouteDesktop />} />
            <Route
              path={ROUTES.ROUTE_EDIT}
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageRouteEditDesktop />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.SECTOR_EDIT}
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageSectorEditDesktop />
                </ProtectedRoute>
              }
            />
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
                <ProtectedRoute
                  requiredRole="user"
                  skeleton={<ProfileSkeleton />}
                >
                  <PageProfileDesktop />
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

export default AppDesktop;
