import type { ConditionBand } from '../entities';

// One ladder, read in two places: the ring that judges the day and the strip
// that judges each hour. Emoji rather than an icon, so the verdict lands
// before any colour or number is read.
const VERDICTS: Record<ConditionBand, string> = {
  excellent: '🔥',
  good: '💪',
  ok: '👌',
  poor: '😕',
  bad: '🛌'
};

export const verdictOf = (band: ConditionBand | null): string | null =>
  band ? VERDICTS[band] : null;
