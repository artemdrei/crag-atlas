import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { PageHomeMobile } from '@web/pages/home';

import { LayoutWithMobileBottomNavigation } from '../router/Router';
import { ROUTES } from '../router/routes';
import { ErrorBoundary } from '../ui/errorBoundary';

const AppMobile = () => (
  <ErrorBoundary>
    <Suspense>
      <Routes>
        <Route element={<LayoutWithMobileBottomNavigation />}>
          <Route path={ROUTES.INDEX} element={<PageHomeMobile />} />
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
);

export default AppMobile;
