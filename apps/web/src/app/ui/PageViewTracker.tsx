import { useTrackPageView } from '@web/shared/lib';

// Its own node: useLocation() would re-render every provider on navigation.
export const PageViewTracker = () => {
  useTrackPageView();

  return null;
};
