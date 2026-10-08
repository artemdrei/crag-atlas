import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { ModalProvider } from '@web/app/providers';
import { avatarUploadDesktopRegistrations } from '@web/features/avatarUpload';
import { catalogEditDesktopRegistrations } from '@web/features/catalogEdit';
import { grantAdminDesktopRegistrations } from '@web/features/grantAdmin';
import { logTickDesktopRegistrations } from '@web/features/logTick';
import { offlineRegionsDesktopRegistrations } from '@web/features/offlineRegions';
import { photoUploadDesktopRegistrations } from '@web/features/photoUpload';
import { routeCommentDesktopRegistrations } from '@web/features/routeComment';
import { sectorQrDesktopRegistrations } from '@web/features/sectorQr';
import { signInPromptDesktopRegistrations } from '@web/features/signInPrompt';
import { topoDesktopRegistrations } from '@web/features/topo';
import { topoEditorDesktopRegistrations } from '@web/features/topoEditor';
import { LogbookTeaser } from '@web/pages/logbook/common';
import { playgroundDesktopRegistrations } from '@web/pages/playground/registrations';
import { ProfileSkeleton, ProfileTeaser } from '@web/pages/profile/common';
import { routeMediaDesktopRegistrations } from '@web/widgets/routeMedia';
import { TicksSkeleton } from '@web/widgets/tickList';

import { lazyPage as page } from '../router/lazyPage';
import {
  GuestOnlyRoute,
  LayoutWithSidebar,
  MembersOnlyRoute,
  ProtectedRoute
} from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

// Below the device split on purpose: above it, the root bundle carries both
// devices' features.
const registrations = [
  ...avatarUploadDesktopRegistrations,
  ...catalogEditDesktopRegistrations,
  ...grantAdminDesktopRegistrations,
  ...logTickDesktopRegistrations,
  ...topoDesktopRegistrations,
  ...topoEditorDesktopRegistrations,
  ...photoUploadDesktopRegistrations,
  ...routeCommentDesktopRegistrations,
  ...offlineRegionsDesktopRegistrations,
  ...signInPromptDesktopRegistrations,
  ...routeMediaDesktopRegistrations,
  ...sectorQrDesktopRegistrations,
  ...playgroundDesktopRegistrations
];

const PageAdminDesktop = page(
  () => import('@web/pages/admin'),
  'PageAdminDesktop'
);
const PageAdminAccessDesktop = page(
  () => import('@web/pages/adminAccess'),
  'PageAdminAccessDesktop'
);
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
const PageQrCodesDesktop = page(
  () => import('@web/pages/qrCodes'),
  'PageQrCodesDesktop'
);
const PageQrRedirectDesktop = page(
  () => import('@web/pages/qrRedirect'),
  'PageQrRedirectDesktop'
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
          <Route element={<LayoutWithSidebar hasSearch />}>
            <Route path={ROUTES.INDEX} element={<PageHomeDesktop />} />
            <Route path={ROUTES.REGION} element={<PageRegionDesktop />} />
            <Route path={ROUTES.SECTOR} element={<PageSectorDesktop />} />
            <Route path={ROUTES.ROUTE_DETAIL} element={<PageRouteDesktop />} />
            <Route path={ROUTES.QR} element={<PageQrRedirectDesktop />} />
            <Route
              path={ROUTES.ADMIN}
              element={
                <ProtectedRoute requiredRole="admin">
                  <PageAdminDesktop />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to={ROUTES.ADMIN_ACCESS} replace />}
              />
              <Route
                path={ROUTES.ADMIN_ACCESS}
                element={<PageAdminAccessDesktop />}
              />
              <Route
                path={ROUTES.ADMIN_QR_CODES}
                element={<PageQrCodesDesktop />}
              />
            </Route>
            <Route
              path={ROUTES.ACCESS}
              element={<Navigate to={ROUTES.ADMIN_ACCESS} replace />}
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
                <MembersOnlyRoute
                  skeleton={<TicksSkeleton />}
                  teaser={<LogbookTeaser />}
                >
                  <PageLogbookDesktop />
                </MembersOnlyRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE}
              element={
                <MembersOnlyRoute
                  skeleton={<ProfileSkeleton />}
                  teaser={<ProfileTeaser />}
                >
                  <PageProfileDesktop />
                </MembersOnlyRoute>
              }
            />
          </Route>
          <Route element={<LayoutWithSidebar />}>
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
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.INDEX} replace />} />
        </Routes>
      </Suspense>
    </ModalProvider>
  </ErrorBoundary>
);

export default AppDesktop;
