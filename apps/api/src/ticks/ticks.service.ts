import { Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

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
import type { Coords } from '../common/utils/point';
import { userClient } from '../common/utils/userClient';
import { publicSupabase, storagePublicUrl } from '../config/supabase.client';
import { MEDIA_BUCKET } from '../media/media.types';
import {
  observedHour,
  type TickWeatherRow,
  toWeatherDto,
  type WeatherEntry
} from '../weather/weather.mapper';
import { WeatherService } from '../weather/weather.service';
import type {
  TickWeatherDto,
  WeatherBackfillDto
} from '../weather/weather.types';
import {
  ASCENT_TYPES,
  type CreateTickDto,
  DISCIPLINES,
  type Discipline,
  TICK_SORTS,
  type TickDto,
  type TickFeedPageDto,
  type TickPageDto,
  type TickSort,
  type TickStatsDto,
  type UpdateTickDto
} from './ticks.types';

export interface TickPageParams {
  discipline?: Discipline;
  ascentType?: TickDto['ascentType'];
  sort?: TickSort;
  limit?: number;
  offset?: number;
}

interface BackfillRow {
  id: string;
  climbed_at: string;
  climbed_at_time: string | null;
  routes: { sectors: Coords } | null;
}

interface TickPageIds {
  ids: string[];
  total: number;
}

// Embedded through the ticks → routes → sectors foreign keys, so a logbook
// page is one query, not one per tick.
const COLUMNS =
  '*, routes (id_sector, name, name_local, grade, grade_scale, sectors (name, id_region, regions (name, country))), users!ticks_id_user_fkey (display_name, avatar_url), partner:users!ticks_id_partner_fkey (display_name), route_media (id, kind, url, storage_path), tick_weather (*)';

// `!inner` on both joins is what lets the point filter below reach the
// sector, and the weather embed is what lets the null filter reach the row.
const BACKFILL_COLUMNS =
  'id,climbed_at,climbed_at_time,routes!inner(sectors!inner(lat,lng)),tick_weather!left(id_tick)';
const BACKFILL_BATCH = 50;

const PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 200;
const FEED_PAGE_SIZE = 20;
const MAX_FEED_PAGE_SIZE = 50;

interface TickRow {
  id: string;
  id_user: string;
  id_route: string;
  ascent_type: TickDto['ascentType'];
  climbed_at: string;
  climbed_at_time: string | null;
  attempts: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  routes: {
    id_sector: string;
    name: string;
    name_local: string | null;
    grade: string;
    grade_scale: GradeScale;
    sectors: {
      name: string;
      id_region: string;
      regions: { name: string; country: string | null } | null;
    } | null;
  } | null;
  rating: number | null;
  grade_opinion: TickDto['gradeOpinion'];
  grade_vote: string | null;
  note_private: boolean;
  id_partner: string | null;
  partner_name: string | null;
  users: { display_name: string; avatar_url: string | null } | null;
  partner: { display_name: string } | null;
  route_media: {
    id: string;
    kind: 'video' | 'photo';
    url: string | null;
    storage_path: string | null;
  }[];
  tick_weather: TickWeatherRow | null;
}

@Injectable()
export class TicksService {
  constructor(private readonly weatherService: WeatherService) {}

  // The page's ids are decided in SQL, because the order the reader asked for
  // lives on the route, not on the tick.
  async findMine(
    authUser: AuthUser,
    params: TickPageParams = {}
  ): Promise<TickPageDto> {
    const limit = Math.min(
      Math.max(Number(params.limit) || PAGE_SIZE, 1),
      MAX_PAGE_SIZE
    );
    const offset = Math.max(Number(params.offset) || 0, 0);
    const client = userClient(authUser);

    if (params.ascentType) {
      assertAscentType(params.ascentType);
    }

    if (params.discipline && !DISCIPLINES.includes(params.discipline)) {
      throw new ValidationException('Unknown discipline');
    }

    if (params.sort && !TICK_SORTS.includes(params.sort)) {
      throw new ValidationException('Unknown sort');
    }

    const { data, error: pageError } = await client.rpc('tick_page', {
      id_user: authUser.idUser,
      discipline: params.discipline ?? null,
      ascent_type: params.ascentType ?? null,
      sort: params.sort ?? 'date',
      page_limit: limit,
      page_offset: offset
    });

    if (pageError) {
      throw readFailed(
        'Could not load the logbook',
        'TICKS_READ_FAILED',
        pageError
      );
    }

    const page = data as TickPageIds;
    const items = await this.findByIds(authUser, page.ids);

    return {
      items,
      total: page.total,
      nextOffset:
        offset + page.ids.length < page.total ? offset + page.ids.length : null
    };
  }

  async stats(authUser: AuthUser): Promise<TickStatsDto> {
    const { data, error } = await userClient(authUser).rpc('tick_stats', {
      id_user: authUser.idUser
    });

    if (error) {
      throw readFailed(
        'Could not load the logbook stats',
        'TICK_STATS_READ_FAILED',
        error
      );
    }

    return data as TickStatsDto;
  }

  private async findByIds(
    authUser: AuthUser,
    ids: string[]
  ): Promise<TickDto[]> {
    if (ids.length === 0) {
      return [];
    }

    const { data, error } = await userClient(authUser)
      .from('ticks')
      .select(COLUMNS)
      .in('id', ids)
      .returns<TickRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the logbook',
        'TICKS_READ_FAILED',
        error
      );
    }

    // `in` answers in whatever order it likes.
    const byId = new Map(data.map((row) => [row.id, row]));

    return toTickDtos(
      ids.map((id) => byId.get(id)).filter((row): row is TickRow => !!row),
      authUser.idUser
    );
  }

  // No viewer id reaches the mapper, so a private note stays hidden even from
  // its author here.
  async findByRoute(idRoute: string): Promise<TickDto[]> {
    const { data, error } = await publicSupabase()
      .from('ticks')
      .select(COLUMNS)
      .eq('id_route', idRoute)
      .order('climbed_at', { ascending: false })
      .order('id', { ascending: false })
      .returns<TickRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the ascents',
        'TICKS_ROUTE_READ_FAILED',
        error
      );
    }

    return data.map((row) => toTickDto(row, ''));
  }

  async create(authUser: AuthUser, payload: CreateTickDto): Promise<TickDto> {
    if (!payload.idRoute?.trim()) {
      throw new ValidationException('An idRoute is required');
    }

    assertAscentType(payload.ascentType);

    const client = userClient(authUser);
    const { data, error } = await client
      .from('ticks')
      .insert({
        // From the verified token, never the body: RLS checks the same value.
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

    data.tick_weather = await this.applyWeather(client, data, payload.weather);

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
      // One row past the page, so no second count query.
      .limit(pageSize + 1);

    if (cursor) {
      const [climbedAt, id] = cursor.split('|');

      if (!climbedAt || !id) {
        throw new ValidationException('The cursor is malformed');
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
      items: await toTickDtos(items, authUser.idUser),
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

    const client = userClient(authUser);
    const { data, error } = await client
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

    if (payload.weather !== undefined) {
      data.tick_weather = await this.applyWeather(
        client,
        data,
        payload.weather
      );
    }

    return toTickDto(data, authUser.idUser);
  }

  async backfillWeather(authUser: AuthUser): Promise<WeatherBackfillDto> {
    const client = userClient(authUser);
    const { data, count, error } = await client
      .from('ticks')
      .select(BACKFILL_COLUMNS, { count: 'exact' })
      .eq('id_user', authUser.idUser)
      .is('tick_weather', null)
      .not('routes.sectors.lat', 'is', null)
      .order('climbed_at', { ascending: false })
      .limit(BACKFILL_BATCH)
      .returns<BackfillRow[]>();

    if (error) {
      throw readFailed(
        'Could not load the logbook',
        'TICKS_READ_FAILED',
        error
      );
    }

    const entries: WeatherEntry[] = [];

    for (const tick of data) {
      const { lat, lng } = tick.routes?.sectors ?? {};

      if (lat == null || lng == null) continue;

      const at = observedHour(tick.climbed_at, tick.climbed_at_time);

      try {
        entries.push({
          idTick: tick.id,
          at,
          weather: await this.weatherService.at(lat, lng, at)
        });
      } catch {
        // Swallowed on purpose: a day the provider has nothing for must not
        // cost the whole run.
      }
    }

    await this.weatherService.saveMany(client, entries);

    return {
      filled: entries.length,
      remaining: Math.max((count ?? 0) - entries.length, 0)
    };
  }

  private applyWeather(
    client: SupabaseClient,
    row: TickRow,
    weather: TickWeatherDto | null | undefined
  ): Promise<TickWeatherRow | null> | null {
    if (!weather) {
      return weather === null
        ? this.weatherService.clear(client, row.id).then(() => null)
        : null;
    }

    return this.weatherService.save(client, {
      idTick: row.id,
      at: observedHour(row.climbed_at, row.climbed_at_time),
      weather
    });
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
      `An ascentType must be one of: ${ASCENT_TYPES.join(', ')}`
    );
  }
};

const toTickColumns = (payload: CreateTickDto | UpdateTickDto) => ({
  attempts: payload.attempts ?? null,
  note: payload.note ?? null,
  rating: payload.rating ?? null,
  grade_opinion: payload.gradeOpinion ?? null,
  grade_vote: payload.gradeVote ?? null,
  climbed_at_time: payload.climbedAtTime || null,
  note_private: payload.notePrivate ?? false,
  id_partner: payload.idPartner ?? null,
  // The database refuses a row holding both.
  partner_name: payload.idPartner ? null : payload.partnerName?.trim() || null
});

// The select policy publishes every tick row, so this is the only thing
// keeping a private note in. Required, so a new caller cannot forget it.
interface RouteMarks {
  hasPhoto: boolean;
  hasVideo: boolean;
  rating: number | null;
}

const toTickDtos = async (
  rows: TickRow[],
  idViewer: string
): Promise<TickDto[]> => {
  const marks = await routeMarks(rows.map((row) => row.id_route));

  return rows.map((row) => toTickDto(row, idViewer, marks.get(row.id_route)));
};

const routeMarks = async (
  idRoutes: string[]
): Promise<Map<string, RouteMarks>> => {
  const unique = [...new Set(idRoutes)];
  const marks = new Map<string, RouteMarks>();

  if (unique.length === 0) return marks;

  const { data, error } = await publicSupabase()
    .from('routes_with_stats')
    .select('id, rating, has_photo, has_video')
    .in('id', unique)
    .returns<
      {
        id: string;
        rating: number | null;
        has_photo: boolean;
        has_video: boolean;
      }[]
    >();

  if (error) {
    throw readFailed(
      'Could not load the route marks',
      'TICKS_ROUTE_MARKS_FAILED',
      error
    );
  }

  for (const row of data) {
    marks.set(row.id, {
      hasPhoto: row.has_photo,
      hasVideo: row.has_video,
      rating: row.rating
    });
  }

  return marks;
};

const toTickDto = (
  row: TickRow,
  idViewer: string,
  marks?: RouteMarks
): TickDto => ({
  id: row.id,
  idUser: row.id_user,
  idRoute: row.id_route,
  idSector: row.routes?.id_sector ?? null,
  idRegion: row.routes?.sectors?.id_region ?? null,
  routeName: row.routes?.name ?? null,
  routeNameLocal: row.routes?.name_local ?? null,
  routeGrade: row.routes?.grade ?? null,
  routeGradeScale: row.routes?.grade_scale ?? null,
  sectorName: row.routes?.sectors?.name ?? null,
  regionName: row.routes?.sectors?.regions?.name ?? null,
  regionCountry: row.routes?.sectors?.regions?.country ?? null,
  ascentType: row.ascent_type,
  climbedAt: row.climbed_at,
  climbedAtTime: row.climbed_at_time?.slice(0, 5) ?? null,
  attempts: row.attempts,
  weather: row.tick_weather ? toWeatherDto(row.tick_weather) : null,
  note: row.note_private && row.id_user !== idViewer ? null : row.note,
  notePrivate: row.note_private,
  rating: row.rating,
  gradeOpinion: row.grade_opinion,
  gradeVote: row.grade_vote,
  idPartner: row.id_partner,
  partnerName: row.partner?.display_name ?? row.partner_name ?? null,
  authorName: row.users?.display_name ?? null,
  avatarUrl: row.users?.avatar_url ?? null,
  routeRating: marks?.rating ?? null,
  routeHasPhoto: marks?.hasPhoto,
  routeHasVideo: marks?.hasVideo,
  media: (row.route_media ?? []).map((media) => ({
    id: media.id,
    kind: media.kind,
    url: media.url ?? storagePublicUrl(MEDIA_BUCKET, media.storage_path ?? '')
  })),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});
