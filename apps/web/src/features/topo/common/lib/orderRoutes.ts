export interface OrderableTopo {
  sortOrder: number;
  lines: { idRoute: string; points: number[][] }[];
}

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
  let next = 1;

  for (const line of placed) {
    if (numbers[line.idRoute]) continue;

    numbers[line.idRoute] = next++;
  }

  for (const idRoute of idRestRoutes) {
    if (numbers[idRoute]) continue;

    numbers[idRoute] = next++;
  }

  return numbers;
};
