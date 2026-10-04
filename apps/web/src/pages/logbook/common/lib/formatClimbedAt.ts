import { formatDate, formatDateTime } from '@web/shared/lib';

import type { Tick } from '../entities';

export const formatClimbedAt = (
  { climbedAt, climbedAtTime }: Pick<Tick, 'climbedAt' | 'climbedAtTime'>,
  locale: string
) =>
  climbedAtTime
    ? formatDateTime(`${climbedAt}T${climbedAtTime}`, locale)
    : formatDate(climbedAt, locale);
