import { useSearchParams } from 'react-router';

import { ROUTE_FILTER_PARAMS } from '../entities';

export const useRouteFilterSearch = (): string => {
  const [params] = useSearchParams();
  const carried = new URLSearchParams();

  for (const key of Object.values(ROUTE_FILTER_PARAMS)) {
    const value = params.get(key);

    if (value) carried.set(key, value);
  }

  const search = carried.toString();

  return search ? `?${search}` : '';
};
