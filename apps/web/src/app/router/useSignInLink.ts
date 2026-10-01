import { useLocation } from 'react-router';

import { ROUTES } from './routes';

export const useSignInLink = () => {
  const location = useLocation();

  return { to: ROUTES.LOGIN, from: location.pathname + location.search };
};

export const useSignInReturnPath = () => {
  const location = useLocation();

  return (location.state as { from?: string } | null)?.from ?? ROUTES.INDEX;
};
