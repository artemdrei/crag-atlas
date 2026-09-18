import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { PageHomeDesktop } from '@web/pages/home';
import { PageRegionDesktop } from '@web/pages/region';

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
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppDesktop;
