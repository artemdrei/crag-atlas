import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { PageHomeMobile } from '@web/pages/home';
import { PageLoginMobile } from '@web/pages/login';
import { PageRegionMobile } from '@web/pages/region';
import { PageRouteMobile } from '@web/pages/route';
import { PageSectorMobile } from '@web/pages/sector';

import { LayoutWithMobileBottomNavigation } from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

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
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppMobile;
