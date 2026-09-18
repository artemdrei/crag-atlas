import { Outlet } from 'react-router';

import { AppLayoutDesktop } from '@web/app/desktop/layout';
import { AppBottomNavigation, HeaderMobile } from '@web/app/mobile/layout';

export const LayoutWithSidebar = () => <AppLayoutDesktop />;

export const LayoutWithMobileBottomNavigation = () => (
  <>
    <HeaderMobile />
    <Outlet />
    <AppBottomNavigation />
  </>
);
