import { useState } from 'react';

import type { Topo } from '@crag-atlas/api';

export interface Params {
  topos: Topo[];
}

export const useTopoGallery = ({ topos }: Params) => {
  const [idActiveTopo, setIdActiveTopo] = useState<string>();

  const activeTopo = topos.find(({ id }) => id === idActiveTopo) ?? topos[0];

  return {
    activeTopo,
    idActiveTopo: activeTopo?.id,
    selectTopo: setIdActiveTopo
  };
};
