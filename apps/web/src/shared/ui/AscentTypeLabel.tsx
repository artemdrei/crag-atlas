import type { Tick } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

export type AscentType = Tick['ascentType'];

export const ASCENT_TYPES: AscentType[] = [
  'onsight',
  'flash',
  'retro_flash',
  'redpoint',
  'toprope',
  'attempt'
];

export interface Props {
  ascentType: AscentType;
}

/** The stored value is data; only its label is UI copy. */
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
