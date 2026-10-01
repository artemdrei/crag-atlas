import type { EditableTopo } from '../entities';

// The one place that has to cope with an id whose topo is already gone.
export const orderedTopos = (
  order: string[],
  topos: Record<string, EditableTopo>
): EditableTopo[] => order.flatMap((id) => topos[id] ?? []);
