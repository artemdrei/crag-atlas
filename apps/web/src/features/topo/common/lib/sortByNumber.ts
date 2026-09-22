/** Routes read in the order they are numbered on the rock; anything unnumbered
    sits at the end. */
export const sortByNumber = <T extends { id: string }>(
  routes: T[],
  numberOf: Record<string, number>
): T[] =>
  [...routes].sort(
    (left, right) =>
      (numberOf[left.id] ?? Number.MAX_SAFE_INTEGER) -
      (numberOf[right.id] ?? Number.MAX_SAFE_INTEGER)
  );
