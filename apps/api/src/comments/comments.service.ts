import { Injectable } from '@nestjs/common';

import {
  AppException,
  ValidationException
} from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type { CommentDto, CreateCommentDto } from './comments.types';

const COLUMNS =
  'id, id_route, id_user, body, created_at, users (display_name, avatar_url)';

interface CommentRow {
  id: string;
  id_route: string;
  id_user: string;
  body: string;
  created_at: string;
  users: { display_name: string; avatar_url: string | null } | null;
}

@Injectable()
export class CommentsService {
  async findByRoute(idRoute: string): Promise<CommentDto[]> {
    const { data, error } = await publicSupabase()
      .from('route_comments')
      .select(COLUMNS)
      .eq('id_route', idRoute)
      .order('created_at', { ascending: false })
      .returns<CommentRow[]>();

    if (error) {
      throw new AppException(
        error.message,
        500,
        error.code ?? 'COMMENTS_READ_FAILED'
      );
    }

    return data.map(toCommentDto);
  }

  async create(
    authUser: AuthUser,
    idRoute: string,
    payload: CreateCommentDto
  ): Promise<CommentDto> {
    const body = payload.body?.trim() ?? '';

    if (!body) {
      throw new ValidationException('A comment cannot be empty', 'BODY_EMPTY');
    }

    const { data, error } = await userClient(authUser)
      .from('route_comments')
      .insert({ id_route: idRoute, id_user: authUser.idUser, body })
      .select(COLUMNS)
      .single<CommentRow>();

    if (error) {
      throw new AppException(
        error.message,
        400,
        error.code ?? 'COMMENT_CREATE_FAILED'
      );
    }

    return toCommentDto(data);
  }
}

const toCommentDto = (row: CommentRow): CommentDto => ({
  id: row.id,
  idRoute: row.id_route,
  idUser: row.id_user,
  authorName: row.users?.display_name ?? '',
  avatarUrl: row.users?.avatar_url ?? null,
  body: row.body,
  createdAt: row.created_at
});
