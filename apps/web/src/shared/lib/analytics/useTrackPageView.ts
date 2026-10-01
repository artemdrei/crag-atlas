import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { track } from '@crag-atlas/analytics';

import { normalizePath } from './normalizePath';

const PAGE_VIEW_DEBOUNCE_MS = 200;

// A guard bouncing a visitor commits as its own navigation, and nobody looked
// at the path it passed through.
export const useTrackPageView = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      track({ name: 'Page Viewed', props: { path: normalizePath(pathname) } });
    }, PAGE_VIEW_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [pathname]);
};
