import { useLingui } from '@lingui/react/macro';

import type { RouteSort } from '../entities';

export const useRouteSortLabel = () => {
  const { t } = useLingui();
  const labels: Record<RouteSort, string> = {
    default: t`Default`,
    rating: t`Rating`,
    length: t`Length`,
    grade: t`Grade`,
    ascents: t`Ascents`
  };

  return (sort: RouteSort) => labels[sort];
};
