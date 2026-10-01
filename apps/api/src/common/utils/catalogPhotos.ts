import { Logger } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { MEDIA_BUCKET } from '../../media/media.types';
import { removePhotos } from './photoStorage';

const TOPOS_BUCKET = 'topos';
const REGIONS_BUCKET = 'regions';

const logger = new Logger('CatalogPhotos');

export interface CatalogScope {
  idRegion?: string;
  idSector?: string;
}

export interface CatalogPhotos {
  topos: string[];
  media: string[];
  regions: string[];
}

const paths = (rows: { storage_path: string | null }[] | null): string[] =>
  (rows ?? [])
    .map(({ storage_path }) => storage_path)
    .filter((path): path is string => !!path);

// A cascade cannot reach storage, so the paths are read while the rows still
// exist and the objects removed once they are gone.
export const findPhotosUnder = async (
  client: SupabaseClient,
  { idRegion, idSector }: CatalogScope
): Promise<CatalogPhotos> => {
  const idsSectors = idSector ? [idSector] : await sectorsOf(client, idRegion);

  if (idsSectors.length === 0 && !idRegion) {
    return { topos: [], media: [], regions: [] };
  }

  const { data: topos } = await client
    .from('topos')
    .select('storage_path')
    .in('id_sector', idsSectors);

  const { data: routes } = await client
    .from('routes')
    .select('id')
    .in('id_sector', idsSectors);

  const idsRoutes = (routes ?? []).map(({ id }) => id as string);
  const { data: media } = idsRoutes.length
    ? await client
        .from('route_media')
        .select('storage_path')
        .in('id_route', idsRoutes)
    : { data: [] };

  const { data: region } = idRegion
    ? await client
        .from('regions')
        .select('photo_path')
        .eq('id', idRegion)
        .maybeSingle<{ photo_path: string | null }>()
    : { data: null };

  return {
    topos: paths(topos),
    media: paths(media),
    regions: region?.photo_path ? [region.photo_path] : []
  };
};

// Best effort, but loud: an orphan is invisible unless the log says so.
export const removeCatalogPhotos = async (
  client: SupabaseClient,
  photos: CatalogPhotos
): Promise<void> => {
  await Promise.all([
    removePhotos(client, TOPOS_BUCKET, photos.topos),
    removePhotos(client, MEDIA_BUCKET, photos.media),
    removePhotos(client, REGIONS_BUCKET, photos.regions)
  ]);

  const count =
    photos.topos.length + photos.media.length + photos.regions.length;

  if (count > 0) logger.log(`Removed ${count} object(s) of an erased row`);
};

const sectorsOf = async (
  client: SupabaseClient,
  idRegion?: string
): Promise<string[]> => {
  if (!idRegion) return [];

  const { data } = await client
    .from('sectors')
    .select('id')
    .eq('id_region', idRegion);

  return (data ?? []).map(({ id }) => id as string);
};
