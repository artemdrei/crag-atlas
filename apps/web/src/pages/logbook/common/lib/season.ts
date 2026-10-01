export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

const BY_MONTH: Season[] = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter'
];

export const seasonOf = (climbedAt: string): Season | undefined =>
  BY_MONTH[Number(climbedAt.slice(5, 7)) - 1];
