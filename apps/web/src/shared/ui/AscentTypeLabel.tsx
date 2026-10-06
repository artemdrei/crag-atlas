import { useLingui } from '@lingui/react/macro';

import type { AscentType } from '@web/shared/types';

export interface Props {
  ascentType: AscentType;
}

export const AscentTypeLabel = ({ ascentType }: Props) => {
  const { t } = useLingui();

  const labels: Record<AscentType, string> = {
    onsight: t`Onsight`,
    flash: t`Flash`,
    retro_flash: t`Retro flash`,
    redpoint: t`Redpoint`,
    toprope: t`Top rope`,
    attempt: t`Attempt`
  };

  return <>{labels[ascentType]}</>;
};
