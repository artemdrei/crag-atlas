import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { ValidationException } from '../common/exceptions/app.exception';
import { writeFailed } from '../common/exceptions/database.exception';
import type { UploadedPhoto } from './topos.types';

const logger = new Logger('TopoStorage');

export const TOPOS_BUCKET = 'topos';
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** A new key per upload, so a replaced photo can never be served from cache. */
export const buildPhotoPath = (idSector: string): string =>
  `${idSector}/${randomUUID()}.webp`;

/** The declared mimetype comes from the client, so the bytes get the last word. */
export const assertWebp = ({ buffer }: UploadedPhoto): void => {
  const isWebp =
    buffer.length > 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  if (!isWebp) {
    throw new ValidationException(
      'Only WebP images are accepted',
      'PHOTO_NOT_WEBP'
    );
  }
};

export const parseDimension = (value: unknown, field: string): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationException(
      `"${field}" must be a positive integer`,
      'PHOTO_DIMENSION_INVALID'
    );
  }

  return parsed;
};

export const uploadPhoto = async (
  client: SupabaseClient,
  path: string,
  photo: UploadedPhoto
): Promise<void> => {
  const { error } = await client.storage
    .from(TOPOS_BUCKET)
    .upload(path, photo.buffer, { contentType: 'image/webp', upsert: false });

  if (error) {
    throw writeFailed(
      'Could not store the photo',
      'PHOTO_UPLOAD_FAILED',
      error
    );
  }
};

/** Best effort: an orphaned object costs kilobytes, a false error costs trust. */
export const removePhoto = async (
  client: SupabaseClient,
  path: string
): Promise<void> => {
  const { error } = await client.storage.from(TOPOS_BUCKET).remove([path]);

  if (error) {
    logger.warn(`Orphaned topo object "${path}": ${error.message}`);
  }
};
