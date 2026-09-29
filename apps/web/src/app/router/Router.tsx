import { Navigate, useLocation } from 'react-router';

import { AppLayoutDesktop } from '@web/app/desktop/layout';
import { AppLayoutMobile } from '@web/app/mobile/layout';
import type { Role } from '@web/app/providers';
import { useUser } from '@web/app/providers';

import { ROUTES } from './routes';

export const LayoutWithSidebar = () => <AppLayoutDesktop />;

export const LayoutWithMobileBottomNavigation = () => <AppLayoutMobile />;

export const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) return null;

  if (isAuthenticated) return <Navigate to={ROUTES.INDEX} replace />;

  return children;
};

// A signed-in visitor without the role goes to the catalog, not to login:
// `GuestOnlyRoute` would bounce them straight back off it.
export const ProtectedRoute = ({
  requiredRole,
  skeleton,
  children
}: {
  requiredRole: Role;
  skeleton?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { hasRole, isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) return skeleton ?? null;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (!hasRole(requiredRole)) return <Navigate to={ROUTES.INDEX} replace />;

  return children;
};
