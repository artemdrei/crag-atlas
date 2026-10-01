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
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type {
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto
} from './comments.types';

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
      throw readFailed(
        'Could not load the comments',
        'COMMENTS_READ_FAILED',
        error
      );
    }

    return data.map(toCommentDto);
  }

  async create(
    authUser: AuthUser,
    idRoute: string,
    payload: CreateCommentDto
  ): Promise<CommentDto> {
    const body = requireBody(payload.body);

    const { data, error } = await userClient(authUser)
      .from('route_comments')
      .insert({ id_route: idRoute, id_user: authUser.idUser, body })
      .select(COLUMNS)
      .single<CommentRow>();

    if (error) {
      throw writeFailed(
        'Could not post the comment',
        'COMMENT_CREATE_FAILED',
        error
      );
    }

    return toCommentDto(data);
  }

  async update(
    authUser: AuthUser,
    idComment: string,
    payload: UpdateCommentDto
  ): Promise<CommentDto> {
    const body = requireBody(payload.body);

    const { data, error } = await userClient(authUser)
      .from('route_comments')
      .update({ body })
      .eq('id', idComment)
      .select(COLUMNS)
      .maybeSingle<CommentRow>();

    if (error) {
      throw writeFailed(
        'Could not save the comment',
        'COMMENT_UPDATE_FAILED',
        error
      );
    }

    // Invisible to this policy, so a missing row means "not yours" and "not
    // there" alike.
    if (!data) {
      throw new NotFoundException('Comment not found', 'COMMENT_NOT_FOUND');
    }

    return toCommentDto(data);
  }

  async remove(authUser: AuthUser, idComment: string): Promise<void> {
    const { data, error } = await userClient(authUser)
      .from('route_comments')
      .delete()
      .eq('id', idComment)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw writeFailed(
        'Could not delete the comment',
        'COMMENT_DELETE_FAILED',
        error
      );
    }

    if (!data) {
      throw new NotFoundException('Comment not found', 'COMMENT_NOT_FOUND');
    }
  }
}

const requireBody = (body: string): string => {
  const trimmed = body?.trim() ?? '';

  if (!trimmed) {
    throw new ValidationException('A comment cannot be empty', 'BODY_EMPTY');
  }

  return trimmed;
};

const toCommentDto = (row: CommentRow): CommentDto => ({
  id: row.id,
  idRoute: row.id_route,
  idUser: row.id_user,
  authorName: row.users?.display_name ?? '',
  avatarUrl: row.users?.avatar_url ?? null,
  body: row.body,
  createdAt: row.created_at
});
