import type { CreateRouteMedia, RouteMedia } from '@crag-atlas/api';

import { apiPost, apiUpload } from '@web/shared/api';
import { imageToWebp } from '@web/shared/lib';

import type { PendingMedia } from '../entities';

export const saveTickMedia = async (
  idRoute: string,
  idTick: string,
  pending: PendingMedia
) => {
  const photos = await Promise.all(
    pending.files.map((file) => imageToWebp(file))
  );

  // The gallery orders media by created_at, so the rows are posted in the
  // order the climber picked them, not in whichever finishes first.
  for (const url of pending.links) {
    const payload: CreateRouteMedia = { kind: 'video', url, idTick };

    await apiPost<RouteMedia>(`/routes/${idRoute}/media`, payload);
  }

  for (const { blob } of photos) {
    const body = new FormData();

    body.append('file', blob, 'photo.webp');

    await apiUpload<RouteMedia>(
      'POST',
      `/routes/${idRoute}/media/photo?idTick=${idTick}`,
      body
    );
  }
};
