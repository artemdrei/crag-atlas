import type { AscentType } from '@web/shared/types';

import type { Tick } from '../entities';

export const FIRST_ASCENT_TYPES: AscentType[] = [
  'onsight',
  'flash',
  'retro_flash'
];

export const toRouteSends = (ticks: Tick[]) => {
  const sends = ticks.filter((tick) => tick.ascentType !== 'attempt');

  return {
    firstSend: sends.find((tick) => !tick.isRepeat) ?? null,
    sendCount: sends.length,
    repeats: sends.filter((tick) => tick.isRepeat)
  };
};
