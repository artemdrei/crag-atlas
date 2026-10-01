import { type RefObject, useEffect } from 'react';
import { useLocation } from 'react-router';

// The app scrolls inside its own element, which the browser's restoration
// never sees.
export const useScrollTopOnNavigate = (ref: RefObject<HTMLElement | null>) => {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: the path fires this rather than being read, and dropping it stops the reset
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname, ref]);
};
