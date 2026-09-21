import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

import { ValidationException } from '../exceptions/app.exception';

const logger = new Logger('PhotoStorage');

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** What multer hands over; `@types/multer` is not installed. */
export interface UploadedPhoto {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** A new key per upload, so a replaced photo can never be served from cache. */
export const buildPhotoPath = (prefix: string): string =>
  `${prefix}/${randomUUID()}.webp`;

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

export const uploadPhoto = async (
  client: SupabaseClient,
  bucket: string,
  path: string,
  photo: UploadedPhoto
): Promise<void> => {
  const { error } = await client.storage
    .from(bucket)
    .upload(path, photo.buffer, {
      contentType: 'image/webp',
      upsert: false
    });

  if (error) {
    throw new ValidationException(error.message, 'PHOTO_UPLOAD_FAILED');
  }
};

/** Best effort: an orphaned object costs kilobytes, a false error costs trust. */
export const removePhoto = async (
  client: SupabaseClient,
  bucket: string,
  path: string
): Promise<void> => {
  const { error } = await client.storage.from(bucket).remove([path]);

  if (error) {
    logger.warn(`Orphaned object "${bucket}/${path}": ${error.message}`);
  }
};
