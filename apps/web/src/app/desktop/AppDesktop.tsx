import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { PageHomeDesktop } from '@web/pages/home';
import { PageRegionDesktop } from '@web/pages/region';
import { PageRouteDesktop } from '@web/pages/route';
import { PageSectorDesktop } from '@web/pages/sector';

import { LayoutWithSidebar } from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

const AppDesktop = () => (
  <ErrorBoundary>
    <Suspense>
      <Routes>
        <Route element={<LayoutWithSidebar />}>
          <Route path={ROUTES.INDEX} element={<PageHomeDesktop />} />
          <Route path={ROUTES.REGION} element={<PageRegionDesktop />} />
          <Route path={ROUTES.SECTOR} element={<PageSectorDesktop />} />
          <Route path={ROUTES.ROUTE_DETAIL} element={<PageRouteDesktop />} />
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppDesktop;
