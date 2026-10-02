import type { RouteLine } from '@crag-atlas/api';

import { useModal } from '@web/app/providers';

import type { TopoPhotoPayload } from '../entities';

export interface Params extends Omit<TopoPhotoPayload, 'photoUrl' | 'lines'> {
  topo?: { photoUrl: string; lines: RouteLine[] } | null;
  lines?: RouteLine[];
}

export const useOpenTopoPhoto = () => {
  const { openModal } = useModal();

  return ({ topo, lines, ...photo }: Params) => {
    if (!topo) return;

    openModal('VIEW_TOPO_PHOTO', {
      photoUrl: topo.photoUrl,
      lines: lines ?? topo.lines,
      ...photo
    });
  };
};
