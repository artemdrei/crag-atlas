import { useState } from 'react';

import type { Route } from '../entities';

export const useSectorSelection = () => {
  const [idHighlightedRoute, setIdHighlightedRoute] = useState<string>();

  return {
    idHighlightedRoute,
    highlightRoute: (route?: Route) => setIdHighlightedRoute(route?.id)
  };
};
