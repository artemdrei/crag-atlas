import type { TopoEditorSession } from '../entities';

// One line per route, so the first match is the answer.
export const photoOf = (
  session: TopoEditorSession,
  idRoute: string
): string | undefined =>
  session.order.find((id) => !!session.topos[id]?.lines[idRoute]);
