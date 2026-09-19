import { Navigate, useLocation } from 'react-router';

import { AppLayoutDesktop } from '@web/app/desktop/layout';
import { AppLayoutMobile } from '@web/app/mobile/layout';
import type { Role } from '@web/app/providers';
import { useUser } from '@web/app/providers';

import { ROUTES } from './routes';

export const LayoutWithSidebar = () => <AppLayoutDesktop />;

export const LayoutWithMobileBottomNavigation = () => <AppLayoutMobile />;

export const ProtectedRoute = ({
  role,
  children
}: {
  role: Role;
  children: React.ReactNode;
}) => {
  const { hasRole, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) return null;

  if (!hasRole(role)) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
};
