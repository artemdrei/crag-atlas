import { Injectable } from '@nestjs/common';

import { ValidationException } from '../common/exceptions/app.exception';
import { readFailed } from '../common/exceptions/database.exception';
import type { GradeScale } from '../common/utils/grade';
import { gradeScoreRange, isValidGrade } from '../common/utils/grade';
import { readCursor, toPage } from '../common/utils/keysetPage';
import { idYoutubeOf, youtubeWatchUrl } from '../common/utils/youtube';
import { publicSupabase } from '../config/supabase.client';
import type {
  VideoDto,
  VideoPageDto,
  VideoPreviewDto,
  VideoRouteDto,
  VideoSort
} from './media.types';
import { VIDEO_SORTS } from './media.types';

const PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;
const OEMBED_TIMEOUT_MS = 5_000;

const ROUTE_COLUMNS =
  'id, id_sector, name, name_local, grade, grade_scale, sectors (name, id_region, regions (name))';

const VIDEO_COLUMNS = `id, id_user, id_tick, id_youtube, title, channel_name, published_at, created_at, users (display_name), routes (${ROUTE_COLUMNS})`;

interface RouteRow {
  id: string;
  id_sector: string;
  name: string;
  name_local: string | null;
  grade: string;
  grade_scale: GradeScale;
  sectors: {
    name: string;
    id_region: string;
    regions: { name: string } | null;
  } | null;
}

interface VideoRow {
  id: string;
  id_user: string;
  id_tick: string | null;
  id_youtube: string;
  title: string;
  channel_name: string | null;
  published_at: string | null;
  created_at: string;
  users: { display_name: string } | null;
  routes: RouteRow;
}

interface MediaPageIds {
  total: number;
  ids: string[];
}

interface OEmbed {
  title?: string;
  author_name?: string;
}

export interface VideoQuery {
  query?: string;
  gradeFrom?: string;
  gradeTo?: string;
  sort?: VideoSort;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class VideosService {
  async findPage(params: VideoQuery): Promise<VideoPageDto> {
    const pageSize = Math.min(
      Math.max(params.limit || PAGE_SIZE, 1),
      MAX_PAGE_SIZE
    );
    const sort = params.sort ?? 'newest';

    if (!VIDEO_SORTS.includes(sort)) {
      throw new ValidationException(
        `Unknown sort "${sort}"`,
        'VIDEO_SORT_UNKNOWN'
      );
    }

    const cursor = params.cursor ? readCursor(params.cursor) : undefined;

    const { data, error } = await publicSupabase().rpc('media_page', {
      term: params.query?.trim() || null,
      grade_min: params.gradeFrom ? scoreOf(params.gradeFrom)[0] : null,
      grade_max: params.gradeTo ? scoreOf(params.gradeTo)[1] : null,
      newest_first: sort === 'newest',
      cursor_created_at: cursor?.value ?? null,
      id_cursor: cursor?.id ?? null,
      page_limit: pageSize + 1
    });

    if (error) {
      throw readFailed(
        'Could not load the videos',
        'VIDEOS_READ_FAILED',
        error
      );
    }

    const page = data as MediaPageIds;
    const rows = await findByIds(page.ids);
    const { items, nextCursor } = toPage(
      rows.map((row) => ({
        ...row,
        sorted_at: row.published_at ?? row.created_at
      })),
      pageSize,
      'sorted_at'
    );

    return { items: items.map(toVideoDto), total: page.total, nextCursor };
  }

  async preview(url: string): Promise<VideoPreviewDto> {
    const idYoutube = idYoutubeOf(url ?? '');

    if (!idYoutube) {
      throw new ValidationException(
        'Only YouTube links are accepted',
        'URL_UNSUPPORTED'
      );
    }

    const [existing, oEmbed] = await Promise.all([
      findByYoutubeId(idYoutube),
      readOEmbed(idYoutube)
    ]);

    return {
      idYoutube,
      title: oEmbed?.title ?? null,
      channelName: oEmbed?.author_name ?? null,
      suggestedRoute:
        !existing && oEmbed?.title ? await routeInTitle(oEmbed.title) : null,
      existing: existing ? toVideoDto(existing) : null
    };
  }
}

const scoreOf = (grade: string): [number, number] => {
  if (!isValidGrade(grade, 'french')) {
    throw new ValidationException(
      `Unknown grade "${grade}"`,
      'VIDEO_GRADE_UNKNOWN'
    );
  }

  return gradeScoreRange(grade, 'french');
};

const findByIds = async (ids: string[]): Promise<VideoRow[]> => {
  if (ids.length === 0) return [];

  const { data, error } = await publicSupabase()
    .from('route_media')
    .select(VIDEO_COLUMNS)
    .in('id', ids)
    .returns<VideoRow[]>();

  if (error) {
    throw readFailed('Could not load the videos', 'VIDEOS_READ_FAILED', error);
  }

  const byId = new Map(data.map((row) => [row.id, row]));

  return ids.flatMap((id) => byId.get(id) ?? []);
};

const findByYoutubeId = async (idYoutube: string): Promise<VideoRow | null> => {
  const { data, error } = await publicSupabase()
    .from('route_media')
    .select(VIDEO_COLUMNS)
    .eq('id_youtube', idYoutube)
    .maybeSingle<VideoRow>();

  if (error) {
    throw readFailed('Could not check the video', 'VIDEO_READ_FAILED', error);
  }

  return data;
};

const routeInTitle = async (title: string): Promise<VideoRouteDto | null> => {
  const client = publicSupabase();
  const { data: idRoute, error } = await client.rpc('route_in_title', {
    title
  });

  if (error) {
    throw readFailed('Could not match the route', 'VIDEO_ROUTE_FAILED', error);
  }

  if (!idRoute) return null;

  const { data: route, error: routeError } = await client
    .from('routes')
    .select(ROUTE_COLUMNS)
    .eq('id', idRoute as string)
    .maybeSingle<RouteRow>();

  if (routeError) {
    throw readFailed(
      'Could not match the route',
      'VIDEO_ROUTE_FAILED',
      routeError
    );
  }

  return route ? toVideoRouteDto(route) : null;
};

// Best effort: YouTube rate-limits shared hosts, and a private or removed
// video answers 401/404. Neither blocks adding the link.
const readOEmbed = async (idYoutube: string): Promise<OEmbed | null> => {
  const endpoint = new URL('https://www.youtube.com/oembed');

  endpoint.searchParams.set('format', 'json');
  endpoint.searchParams.set('url', youtubeWatchUrl(idYoutube));

  try {
    const response = await fetch(endpoint, {
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS)
    });

    return response.ok ? ((await response.json()) as OEmbed) : null;
  } catch {
    return null;
  }
};

const toVideoRouteDto = (row: RouteRow): VideoRouteDto => ({
  idRoute: row.id,
  idSector: row.id_sector,
  idRegion: row.sectors?.id_region ?? '',
  name: row.name,
  nameLocal: row.name_local,
  grade: row.grade,
  gradeScale: row.grade_scale,
  sectorName: row.sectors?.name ?? '',
  regionName: row.sectors?.regions?.name ?? ''
});

const toVideoDto = (row: VideoRow): VideoDto => ({
  id: row.id,
  idYoutube: row.id_youtube,
  idUser: row.id_user,
  authorName: row.users?.display_name ?? '',
  title: row.title,
  channelName: row.channel_name,
  publishedAt: row.published_at,
  idTick: row.id_tick,
  createdAt: row.created_at,
  route: toVideoRouteDto(row.routes)
});
