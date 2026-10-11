import { useState } from 'react';

import { useApiGetRouteMedia } from './useApiGetRouteMedia';

export const useRouteMediaGallery = (idRoute: string, idMedia?: string) => {
  const { media, isLoading } = useApiGetRouteMedia(idRoute);
  const [idActive, setIdActive] = useState(idMedia);

  // Opened from a row that only knows the route carries media.
  const active = media.find(({ id }) => id === idActive) ?? media[0];

  return { media, active, isLoading, select: setIdActive };
};
