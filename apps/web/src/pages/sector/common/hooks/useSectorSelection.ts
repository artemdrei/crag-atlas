import { useState } from 'react';

export const useSectorSelection = () => {
  const [idHighlightedRoute, setIdHighlightedRoute] = useState<string>();

  return { idHighlightedRoute, highlightRoute: setIdHighlightedRoute };
};
