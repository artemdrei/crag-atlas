import { Injectable } from '@nestjs/common';

import {
  NotFoundException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import {
  assertWebp,
  buildPhotoPath,
  removePhoto,
  type UploadedPhoto,
  uploadPhoto
} from '../common/utils/photoStorage';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import type { CreateMediaDto, MediaDto } from './media.types';
import { MEDIA_BUCKET, MEDIA_KINDS } from './media.types';

const COLUMNS =
  'id, id_route, id_tick, id_user, kind, url, storage_path, title, duration_seconds, created_at, users (display_name)';

interface MediaRow {
  id: string;
  id_route: string;
  id_tick: string | null;
  storage_path: string | null;
  id_user: string;
  kind: MediaDto['kind'];
  url: string | null;
  title: string;
  duration_seconds: number | null;
  created_at: string;
  users: { display_name: string } | null;
}

@Injectable()
export class MediaService {
  async findByRoute(idRoute: string): Promise<MediaDto[]> {
    const { data, error } = await publicSupabase()
      .from('route_media')
      .select(COLUMNS)
      .eq('id_route', idRoute)
      .order('created_at', { ascending: false })
      .returns<MediaRow[]>();

    if (error) {
      throw readFailed('Could not load the media', 'MEDIA_READ_FAILED', error);
    }

    return data.map(toMediaDto);
  }

  async create(
    authUser: AuthUser,
    idRoute: string,
    payload: CreateMediaDto
  ): Promise<MediaDto> {
    if (!MEDIA_KINDS.includes(payload.kind)) {
      throw new ValidationException(
        `Unknown media kind "${payload.kind}"`,
        'KIND_UNKNOWN'
      );
    }

    const url = payload.url?.trim() ?? '';

    if (!url) {
      throw new ValidationException('A link is required', 'URL_EMPTY');
    }

    if (!isHttpUrl(url)) {
      throw new ValidationException(
        'A link must start with http:// or https://',
        'URL_UNSUPPORTED'
      );
    }

    const { data, error } = await userClient(authUser)
      .from('route_media')
      .insert({
        id_route: idRoute,
        id_tick: payload.idTick ?? null,
        id_user: authUser.idUser,
        kind: payload.kind,
        url,
        title: payload.title?.trim() ?? '',
        duration_seconds: payload.durationSeconds ?? null
      })
      .select(COLUMNS)
      .single<MediaRow>();

    if (error) {
      throw writeFailed(
        'Could not add the media',
        'MEDIA_CREATE_FAILED',
        error
      );
    }

    return toMediaDto(data);
  }

  async createPhoto(
    authUser: AuthUser,
    idRoute: string,
    photo: UploadedPhoto,
    idTick?: string
  ): Promise<MediaDto> {
    assertWebp(photo);

    const client = userClient(authUser);
    const path = buildPhotoPath(idRoute);

    await uploadPhoto(client, MEDIA_BUCKET, path, photo);

    const { data, error } = await client
      .from('route_media')
      .insert({
        id_route: idRoute,
        id_tick: idTick ?? null,
        id_user: authUser.idUser,
        kind: 'photo',
        url: null,
        storage_path: path,
        title: ''
      })
      .select(COLUMNS)
      .single<MediaRow>();

    if (error) {
      await removePhoto(client, MEDIA_BUCKET, path);

      throw writeFailed(
        'Could not add the photo',
        'MEDIA_PHOTO_CREATE_FAILED',
        error
      );
    }

    return toMediaDto(data);
  }

  async remove(authUser: AuthUser, idMedia: string): Promise<void> {
    const client = userClient(authUser);

    // The row comes back so its object can follow it out; the bucket is
    // public, so a photo left behind stays downloadable by anyone who ever
    // saw its URL.
    const { data, error } = await client
      .from('route_media')
      .delete()
      .eq('id', idMedia)
      .select('storage_path')
      .maybeSingle<{ storage_path: string | null }>();

    if (error) {
      throw writeFailed(
        'Could not delete the media',
        'MEDIA_DELETE_FAILED',
        error
      );
    }

    // Someone else's media is invisible to this policy, so a missing row
    // means "not yours" and "not there" alike — the caller learns neither.
    if (!data) {
      throw new NotFoundException('Media not found', 'MEDIA_NOT_FOUND');
    }

    if (data.storage_path) {
      await removePhoto(client, MEDIA_BUCKET, data.storage_path);
    }
  }
}

const isHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const toMediaDto = (row: MediaRow): MediaDto => ({
  id: row.id,
  idRoute: row.id_route,
  idTick: row.id_tick,
  idUser: row.id_user,
  authorName: row.users?.display_name ?? '',
  kind: row.kind,
  url: row.url ?? storagePublicUrl(MEDIA_BUCKET, row.storage_path ?? ''),
  title: row.title,
  durationSeconds: row.duration_seconds,
  createdAt: row.created_at
});
