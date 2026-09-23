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
import type { GradeScale } from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import { storagePublicUrl } from '../config/supabase.client';
import { MEDIA_BUCKET } from '../media/media.types';
import {
  ASCENT_TYPES,
  type CreateTickDto,
  type TickDto,
  type TickFeedPageDto,
  type UpdateTickDto
} from './ticks.types';

// The catalog rows come back embedded through the ticks → routes → sectors
// foreign keys, so a logbook page is one query, not one per tick.
const COLUMNS =
  '*, routes (id_sector, name, grade, grade_scale, sectors (name, id_region)), users!ticks_id_user_fkey (display_name, avatar_url), partner:users!ticks_id_partner_fkey (display_name), route_media (id, kind, url, storage_path)';

const FEED_PAGE_SIZE = 20;
const MAX_FEED_PAGE_SIZE = 50;

interface TickRow {
  id: string;
  id_user: string;
  id_route: string;
  ascent_type: TickDto['ascentType'];
  climbed_at: string;
  attempts: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  routes: {
    id_sector: string;
    name: string;
    grade: string;
    grade_scale: GradeScale;
    sectors: { name: string; id_region: string } | null;
  } | null;
  rating: number | null;
  grade_opinion: TickDto['gradeOpinion'];
  grade_vote: string | null;
  note_private: boolean;
  id_partner: string | null;
  users: { display_name: string; avatar_url: string | null } | null;
  partner: { display_name: string } | null;
  route_media: {
    id: string;
    kind: 'video' | 'photo';
    url: string | null;
    storage_path: string | null;
  }[];
}

@Injectable()
export class TicksService {
  async findMine(authUser: AuthUser, idRoute?: string): Promise<TickDto[]> {
    const query = userClient(authUser)
      .from('ticks')
      .select(COLUMNS)
      .eq('id_user', authUser.idUser)
      .order('climbed_at', { ascending: false });

    const { data, error } = await (idRoute
      ? query.eq('id_route', idRoute)
      : query
    ).returns<TickRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the logbook',
        'TICKS_READ_FAILED',
        error
      );
    }

    return data.map((row) => toTickDto(row, authUser.idUser));
  }

  async create(authUser: AuthUser, payload: CreateTickDto): Promise<TickDto> {
    if (!payload.idRoute?.trim()) {
      throw new ValidationException('idRoute is required');
    }

    assertAscentType(payload.ascentType);

    const { data, error } = await userClient(authUser)
      .from('ticks')
      .insert({
        // Taken from the verified token, never from the body — RLS checks the
        // same value, so a forged one would be rejected by the database too.
        id_user: authUser.idUser,
        id_route: payload.idRoute.trim(),
        ascent_type: payload.ascentType,
        climbed_at: payload.climbedAt,
        ...toTickColumns(payload)
      })
      .select(COLUMNS)
      .single<TickRow>();

    if (error) {
      throw writeFailed(
        'Could not log the ascent',
        'TICK_INSERT_FAILED',
        error
      );
    }

    return toTickDto(data, authUser.idUser);
  }

  async findFeed(
    authUser: AuthUser,
    limit?: number,
    cursor?: string
  ): Promise<TickFeedPageDto> {
    const pageSize = Math.min(
      Math.max(Number(limit) || FEED_PAGE_SIZE, 1),
      MAX_FEED_PAGE_SIZE
    );

    let query = userClient(authUser)
      .from('ticks')
      .select(COLUMNS)
      .order('climbed_at', { ascending: false })
      .order('id', { ascending: false })
      // One row past the page tells us whether another page exists without a
      // second count query.
      .limit(pageSize + 1);

    if (cursor) {
      const [climbedAt, id] = cursor.split('|');

      if (!climbedAt || !id) {
        throw new ValidationException('cursor is malformed');
      }

      query = query.or(
        `climbed_at.lt.${climbedAt},and(climbed_at.eq.${climbedAt},id.lt.${id})`
      );
    }

    const { data, error } = await query.returns<TickRow[]>();

    if (error) {
      throw readFailed('Could not load the feed', 'TICKS_FEED_FAILED', error);
    }

    const items = data.slice(0, pageSize);
    const last = items[items.length - 1];

    return {
      items: items.map((row) => toTickDto(row, authUser.idUser)),
      nextCursor:
        data.length > pageSize && last ? `${last.climbed_at}|${last.id}` : null
    };
  }

  async update(
    authUser: AuthUser,
    idTick: string,
    payload: UpdateTickDto
  ): Promise<TickDto> {
    if (payload.ascentType) assertAscentType(payload.ascentType);

    const { data, error } = await userClient(authUser)
      .from('ticks')
      .update({
        ...(payload.ascentType ? { ascent_type: payload.ascentType } : {}),
        ...(payload.climbedAt ? { climbed_at: payload.climbedAt } : {}),
        ...toTickColumns(payload)
      })
      .eq('id', idTick)
      .eq('id_user', authUser.idUser)
      .select(COLUMNS)
      .maybeSingle<TickRow>();

    if (error) {
      throw writeFailed(
        'Could not save the ascent',
        'TICK_UPDATE_FAILED',
        error
      );
    }

    if (!data) throw new NotFoundException('Ascent not found');

    return toTickDto(data, authUser.idUser);
  }

  async remove(authUser: AuthUser, idTick: string): Promise<void> {
    const { error } = await userClient(authUser)
      .from('ticks')
      .delete()
      .eq('id', idTick)
      .eq('id_user', authUser.idUser);

    if (error) {
      throw writeFailed(
        'Could not delete the ascent',
        'TICK_DELETE_FAILED',
        error
      );
    }
  }
}

const assertAscentType = (value: TickDto['ascentType']) => {
  if (!ASCENT_TYPES.includes(value)) {
    throw new ValidationException(
      `ascentType must be one of: ${ASCENT_TYPES.join(', ')}`
    );
  }
};

const toTickColumns = (payload: CreateTickDto | UpdateTickDto) => ({
  attempts: payload.attempts ?? null,
  note: payload.note ?? null,
  rating: payload.rating ?? null,
  grade_opinion: payload.gradeOpinion ?? null,
  grade_vote: payload.gradeVote ?? null,
  note_private: payload.notePrivate ?? false,
  id_partner: payload.idPartner ?? null
});

// A private note must never leave the API for anyone but its author: the
// select policy publishes every tick row, so this is the only thing holding
// it back. Required, not optional, so a new caller cannot forget it.
const toTickDto = (row: TickRow, idViewer: string): TickDto => ({
  id: row.id,
  idUser: row.id_user,
  idRoute: row.id_route,
  idSector: row.routes?.id_sector ?? null,
  idRegion: row.routes?.sectors?.id_region ?? null,
  routeName: row.routes?.name ?? null,
  routeGrade: row.routes?.grade ?? null,
  routeGradeScale: row.routes?.grade_scale ?? null,
  sectorName: row.routes?.sectors?.name ?? null,
  ascentType: row.ascent_type,
  climbedAt: row.climbed_at,
  attempts: row.attempts,
  note: row.note_private && row.id_user !== idViewer ? null : row.note,
  notePrivate: row.note_private,
  rating: row.rating,
  gradeOpinion: row.grade_opinion,
  gradeVote: row.grade_vote,
  idPartner: row.id_partner,
  partnerName: row.partner?.display_name ?? null,
  authorName: row.users?.display_name ?? null,
  avatarUrl: row.users?.avatar_url ?? null,
  media: (row.route_media ?? []).map((media) => ({
    id: media.id,
    kind: media.kind,
    url: media.url ?? storagePublicUrl(MEDIA_BUCKET, media.storage_path ?? '')
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});
