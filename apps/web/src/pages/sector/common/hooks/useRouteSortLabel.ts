import { useLingui } from '@lingui/react/macro';

import type { RouteSort } from '../entities';

export const useRouteSortLabel = () => {
  const { t } = useLingui();
  const labels: Record<RouteSort, string> = {
    default: t`Default`,
    grade: t`Grade`,
    rating: t`Rating`,
    ascents: t`Ascents`
  };

  return (sort: RouteSort) => labels[sort];
};
