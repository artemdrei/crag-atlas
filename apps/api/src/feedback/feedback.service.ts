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
import { applyCursor, toPage } from '../common/utils/keysetPage';
import { assertWithinLimit, TEXT_LIMITS } from '../common/utils/textLimits';
import { userClient } from '../common/utils/userClient';
import { publicSupabase } from '../config/supabase.client';
import type {
  CreateFeedbackDto,
  FeedbackDto,
  FeedbackPageDto
} from './feedback.types';

const COLUMNS =
  'id, id_user, rating, message, email, url, app_version, platform, created_at, users (display_name, avatar_url)';

const PAGE_SIZE = 50;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTEXT_LIMIT = 40;
const URL_LIMIT = 2000;

interface FeedbackRow {
  id: string;
  id_user: string | null;
  rating: number;
  message: string | null;
  email: string | null;
  url: string;
  app_version: string;
  platform: string;
  created_at: string;
  users: { display_name: string; avatar_url: string | null } | null;
}

@Injectable()
export class FeedbackService {
  async findPage(
    authUser: AuthUser,
    cursor?: string
  ): Promise<FeedbackPageDto> {
    const { data, error } = await applyCursor(
      userClient(authUser)
        .from('feedback')
        .select(COLUMNS)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(PAGE_SIZE + 1),
      'created_at',
      cursor
    ).returns<FeedbackRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the feedback',
        'FEEDBACK_READ_FAILED',
        error
      );
    }

    const { items, nextCursor } = toPage(data, PAGE_SIZE, 'created_at');

    return { items: items.map(toFeedbackDto), nextCursor };
  }

  async create(
    payload: CreateFeedbackDto,
    authUser: AuthUser | null,
    authEmail?: string
  ): Promise<void> {
    const rating = Number(payload.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ValidationException(
        'A rating must be a whole number from 1 to 5',
        'FEEDBACK_RATING_INVALID'
      );
    }

    const message = payload.message?.trim() || null;
    assertWithinLimit(message, TEXT_LIMITS.feedbackMessage, 'A message');

    const email = authEmail ?? (payload.email?.trim() || null);

    if (email && (!EMAIL.test(email) || email.length > TEXT_LIMITS.email)) {
      throw new ValidationException(
        'The email address does not look right',
        'FEEDBACK_EMAIL_INVALID'
      );
    }

    const client = authUser ? userClient(authUser) : publicSupabase();
    const { error } = await client.from('feedback').insert({
      id_user: authUser?.idUser ?? null,
      rating,
      message,
      email,
      url: clip(payload.url, URL_LIMIT),
      app_version: clip(payload.appVersion, CONTEXT_LIMIT),
      platform: clip(payload.platform, CONTEXT_LIMIT)
    });

    if (error) {
      throw writeFailed(
        'Could not save the feedback',
        'FEEDBACK_CREATE_FAILED',
        error
      );
    }
  }

  async remove(authUser: AuthUser, idFeedback: string): Promise<void> {
    const { data, error } = await userClient(authUser)
      .from('feedback')
      .delete()
      .eq('id', idFeedback)
      .select('id')
      .maybeSingle<{ id: string }>();

    if (error) {
      throw writeFailed(
        'Could not delete the feedback',
        'FEEDBACK_DELETE_FAILED',
        error
      );
    }

    if (!data) {
      throw new NotFoundException('Feedback not found', 'FEEDBACK_NOT_FOUND');
    }
  }
}

const clip = (value: string | undefined, limit: number): string =>
  (value ?? '').trim().slice(0, limit);

const toFeedbackDto = (row: FeedbackRow): FeedbackDto => ({
  id: row.id,
  idUser: row.id_user,
  authorName: row.users?.display_name ?? null,
  avatarUrl: row.users?.avatar_url ?? null,
  email: row.email,
  rating: row.rating,
  message: row.message,
  url: row.url,
  appVersion: row.app_version,
  platform: row.platform,
  createdAt: row.created_at
});
