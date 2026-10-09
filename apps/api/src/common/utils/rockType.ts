// What the wall is made of decides how long it holds the rain: granite sheds
// it in hours, sandstone drinks it and stays soft for days. The set is kept
// short on purpose — a type an author cannot tell apart from the next one
// would be guessed, not known.
export const ROCK_TYPES = [
  'limestone',
  'sandstone',
  'granite',
  'gneiss',
  'basalt',
  'conglomerate',
  'other'
] as const;

export type RockType = (typeof ROCK_TYPES)[number];

export const isRockType = (value: unknown): value is RockType =>
  ROCK_TYPES.includes(value as RockType);
