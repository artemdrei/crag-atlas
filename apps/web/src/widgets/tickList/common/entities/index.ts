export type { Tick } from '@crag-atlas/api';

export const TICK_VIEWS = ['detailed', 'compact'] as const;

export type TickView = (typeof TICK_VIEWS)[number];

export const DEFAULT_TICK_VIEW: TickView = 'detailed';
