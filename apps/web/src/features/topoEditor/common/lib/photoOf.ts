import type { TopoEditorSession } from '../entities';

/** The photo a route is drawn on. One line per route is what the editor
    offers, so the first match is the answer. */
export const photoOf = (
  session: TopoEditorSession,
  idRoute: string
): string | undefined =>
  session.order.find((id) => !!session.topos[id]?.lines[idRoute]);
