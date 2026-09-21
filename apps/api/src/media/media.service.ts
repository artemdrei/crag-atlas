import { Injectable } from '@nestjs/common';

import {
  AppException,
  ValidationException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { CreateMediaDto, MediaDto } from './media.types';
import { MEDIA_KINDS } from './media.types';

const COLUMNS =
  'id, id_route, id_user, kind, url, title, duration_seconds, created_at, users (display_name)';

interface MediaRow {
  id: string;
  id_route: string;
  id_user: string;
  kind: MediaDto['kind'];
  url: string;
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
      throw new AppException(
        error.message,
        500,
        error.code ?? 'MEDIA_READ_FAILED'
      );
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
        id_user: authUser.idUser,
        kind: payload.kind,
        url,
        title: payload.title?.trim() ?? '',
        duration_seconds: payload.durationSeconds ?? null
      })
      .select(COLUMNS)
      .single<MediaRow>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'MEDIA_CREATE_FAILED'
      );
    }

    return toMediaDto(data);
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
  idUser: row.id_user,
  authorName: row.users?.display_name ?? '',
  kind: row.kind,
  url: row.url,
  title: row.title,
  durationSeconds: row.duration_seconds,
  createdAt: row.created_at
});
