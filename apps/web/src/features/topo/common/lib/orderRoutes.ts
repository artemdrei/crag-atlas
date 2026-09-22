export interface OrderableTopo {
  sortOrder: number;
  lines: { idRoute: string; points: number[][] }[];
}

/** Drawn routes first, photo by photo and left to right; the rest follow. */
export const orderRoutes = (
  topos: OrderableTopo[],
  idRestRoutes: string[] = []
): Record<string, number> => {
  const placed = topos
    .flatMap((topo) =>
      topo.lines.flatMap((line) => {
        const [start] = line.points;
        const [x] = start ?? [];

        return x === undefined
          ? []
          : [{ idRoute: line.idRoute, sortOrder: topo.sortOrder, x }];
      })
    )
    .sort((left, right) =>
      left.sortOrder === right.sortOrder
        ? left.x - right.x
        : left.sortOrder - right.sortOrder
    );

  const numbers: Record<string, number> = {};

  for (const line of placed) {
    if (numbers[line.idRoute]) continue;

    numbers[line.idRoute] = Object.keys(numbers).length + 1;
  }

  for (const idRoute of idRestRoutes) {
    if (numbers[idRoute]) continue;

    numbers[idRoute] = Object.keys(numbers).length + 1;
  }

  return numbers;
};
