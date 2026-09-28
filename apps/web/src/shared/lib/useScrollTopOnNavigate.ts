import { type RefObject, useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Opening a page shows its start. The app scrolls inside its own element
 * rather than the document, so nothing else resets it — the browser's own
 * restoration never sees that element.
 */
export const useScrollTopOnNavigate = (ref: RefObject<HTMLElement | null>) => {
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: the path fires this rather than being read, and dropping it stops the reset
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname, ref]);
};
