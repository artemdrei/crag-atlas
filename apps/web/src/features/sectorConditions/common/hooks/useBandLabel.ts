import { useLingui } from '@lingui/react/macro';

import type { ConditionBand } from '../entities';

export const useBandLabel = () => {
  const { t } = useLingui();

  const labels: Record<ConditionBand, string> = {
    excellent: t`Excellent`,
    good: t`Good`,
    ok: t`OK`,
    poor: t`Poor`,
    bad: t`Bad`
  };

  return (band: ConditionBand | null) => (band ? labels[band] : null);
};
