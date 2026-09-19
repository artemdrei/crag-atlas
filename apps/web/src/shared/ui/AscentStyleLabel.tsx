import type { Tick } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

export type AscentStyle = Tick['ascentStyle'];

export const ASCENT_STYLES: AscentStyle[] = [
  'onsight',
  'flash',
  'retro_flash',
  'redpoint',
  'toprope',
  'attempt'
];

export interface Props {
  ascentStyle: AscentStyle;
}

/** The stored value is data; only its label is UI copy. */
export const AscentStyleLabel = ({ ascentStyle }: Props) => {
  const { t } = useLingui();

  const labels: Record<AscentStyle, string> = {
    onsight: t`Onsight`,
    flash: t`Flash`,
    retro_flash: t`Retro flash`,
    redpoint: t`Redpoint`,
    toprope: t`Top rope`,
    attempt: t`Attempt`
  };

  return <>{labels[ascentStyle]}</>;
};
