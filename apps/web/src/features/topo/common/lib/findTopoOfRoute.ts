import type { OrderableTopo } from './orderRoutes';

interface IdentifiedTopo extends OrderableTopo {
  id: string;
}

export const findTopoOfRoute = <T extends IdentifiedTopo>(
  topos: T[],
  idRoute: string
): T | undefined =>
  topos.find((topo) =>
    topo.lines.some(
      (line) => line.idRoute === idRoute && line.points.length > 0
    )
  );
