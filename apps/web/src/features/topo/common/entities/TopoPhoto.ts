import type { RouteLine } from '@crag-atlas/api';

export interface TopoPhotoPayload {
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  numberOf?: Record<string, number>;
  colorOf?: (idRoute: string) => string | undefined;
}
