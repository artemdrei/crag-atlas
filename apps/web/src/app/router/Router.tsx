import { Navigate } from 'react-router';

import { AppLayoutDesktop } from '@web/app/desktop/layout';
import { AppLayoutMobile } from '@web/app/mobile/layout';
import type { Role } from '@web/app/providers';
import { useUser } from '@web/app/providers';

import { ROUTES } from './routes';
import { useSignInReturnPath } from './useSignInLink';

export const LayoutWithSidebar = ({ hasSearch }: { hasSearch?: boolean }) => (
  <AppLayoutDesktop hasSearch={hasSearch} />
);

export const LayoutWithMobileBottomNavigation = () => <AppLayoutMobile />;

export const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useUser();
  const from = useSignInReturnPath();

  if (isLoading) return null;

  // The login page navigates to the same place on success, and the two race.
  if (isAuthenticated) return <Navigate to={from} replace />;

  return children;
};

export const MembersOnlyRoute = ({
  skeleton,
  teaser,
  children
}: {
  skeleton: React.ReactNode;
  teaser: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) return skeleton;

  if (!isAuthenticated) return teaser;

  return children;
};

export const ProtectedRoute = ({
  requiredRole,
  children
}: {
  requiredRole: Role;
  children: React.ReactNode;
}) => {
  const { hasRole, isLoading } = useUser();

  if (isLoading) return null;

  if (!hasRole(requiredRole)) return <Navigate to={ROUTES.INDEX} replace />;

  return children;
};
