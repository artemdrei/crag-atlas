// How much of the rain a wall keeps off a climber. A cave stays climbable in
// weather that shuts an open crag, so the conditions score cannot read the
// forecast alone — and the catalog, not the scoring, is where the fact lives.
export const SHELTERS = ['open', 'partial', 'full'] as const;

export type Shelter = (typeof SHELTERS)[number];
