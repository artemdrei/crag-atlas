import type { Topo } from '@crag-atlas/api';

export interface TopoGalleryProps {
  topos: Topo[];
  idActiveTopo?: string;
  idHighlightedRoute?: string;
  colorOf?: (idRoute: string) => string | undefined;
  numberOf?: Record<string, number>;
  tickedRoutes?: ReadonlySet<string>;
  onSelectTopo: (idTopo: string) => void;
  onSelectRoute?: (idRoute: string) => void;
  onHoverRoute?: (idRoute?: string) => void;
}
