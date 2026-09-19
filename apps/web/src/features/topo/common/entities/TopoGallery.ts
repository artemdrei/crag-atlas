import type { Topo } from '@crag-atlas/api';

export interface TopoGalleryProps {
  topos: Topo[];
  idActiveTopo?: string;
  idHighlightedRoute?: string;
  colorOf?: (idRoute: string) => string | undefined;
  onSelectTopo: (idTopo: string) => void;
}
