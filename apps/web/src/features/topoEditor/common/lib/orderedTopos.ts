import type { EditableTopo } from '../entities';

/** The session keeps the photo order as ids, so resolving them is the one
    place that has to cope with an id whose topo is already gone. */
export const orderedTopos = (
  order: string[],
  topos: Record<string, EditableTopo>
): EditableTopo[] => order.flatMap((id) => topos[id] ?? []);
