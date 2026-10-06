import type { RouteLine } from '@crag-atlas/api';

export interface TopoPhotoPayload {
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  numberOf?: Record<string, number>;
  tickedRoutes?: ReadonlySet<string>;
  colorOf?: (idRoute: string) => string | undefined;
}
