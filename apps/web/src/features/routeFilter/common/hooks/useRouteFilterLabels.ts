import { useLingui } from '@lingui/react/macro';

import {
  type LengthFilter,
  LONG_ROUTE_METERS,
  type RatingFilter,
  type TickedFilter
} from '../entities';

export const useRouteFilterLabels = () => {
  const { t } = useLingui();
  const meters = LONG_ROUTE_METERS;

  const rating: Record<RatingFilter, string> = {
    any: t`any`,
    '4': '4+',
    '4.5': '4.5+'
  };
  const length: Record<LengthFilter, string> = {
    any: t`any`,
    short: t`< ${meters} m`,
    long: t`${meters} m+`
  };
  const ticked: Record<TickedFilter, string> = {
    any: t`any`,
    notDone: t`not done`,
    done: t`done`
  };

  return { rating, length, ticked };
};
