import { Navigate, Outlet } from 'react-router';

import { AppLayoutDesktop } from '@web/app/desktop/layout';
import { AppBottomNavigation, HeaderMobile } from '@web/app/mobile/layout';
import type { Role } from '@web/app/providers';
import { useUser } from '@web/app/providers';

import { ROUTES } from './routes';

export const LayoutWithSidebar = () => <AppLayoutDesktop />;

export const LayoutWithMobileBottomNavigation = () => (
  <>
    <HeaderMobile />
    <Outlet />
    <AppBottomNavigation />
  </>
);

export const ProtectedRoute = ({
  role,
  children
}: {
  role: Role;
  children: React.ReactNode;
}) => {
  const { hasRole } = useUser();

  if (!hasRole(role)) {
    return <Navigate to={ROUTES.INDEX} replace />;
  }

  return children;
};
