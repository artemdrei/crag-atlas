import { useSearchParams } from 'react-router';

import { filterSearchOf } from '../lib';

export const useRouteFilterSearch = (): string => {
  const [params] = useSearchParams();
  const search = filterSearchOf(params);

  return search ? `?${search}` : '';
};
