import type { Tick } from '@crag-atlas/api';

export type AscentType = Tick['ascentType'];

export const ASCENT_TYPES: AscentType[] = [
  'onsight',
  'flash',
  'retro_flash',
  'redpoint',
  'toprope',
  'attempt'
];
