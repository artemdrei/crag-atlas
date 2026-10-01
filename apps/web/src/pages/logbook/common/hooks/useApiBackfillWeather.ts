import type { WeatherBackfill } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

export const useApiBackfillWeather = () => {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: () => apiPost<WeatherBackfill>('/ticks/weather/backfill', {}),
    onSuccess: ({ filled, remaining }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticks() });
      toast.success(
        remaining > 0
          ? t`Conditions added to ${filled} ascents, ${remaining} still to go`
          : t`Conditions added to ${filled} ascents`
      );
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, backfill: mutate };
};
