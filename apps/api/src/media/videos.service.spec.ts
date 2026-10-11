import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VideosService } from './videos.service';

interface QueryResult {
  data: unknown;
  error: { message: string; code?: string } | null;
}

const ID_A = '00000000-0000-4000-8000-00000000000a';
const ID_B = '00000000-0000-4000-8000-00000000000b';
const ID_C = '00000000-0000-4000-8000-00000000000c';

let rpcResults: Record<string, QueryResult> = {};
let rowsResult: QueryResult = { data: [], error: null };
let routeResult: QueryResult = { data: null, error: null };
const rpc = vi.fn();

vi.mock('../config/supabase.client', () => ({
  publicSupabase: () => {
    const media = {
      select: () => media,
      in: () => media,
      eq: () => media,
      returns: () => Promise.resolve(rowsResult),
      maybeSingle: () => Promise.resolve(rowsResult)
    };
    const routes = {
      select: () => routes,
      eq: () => routes,
      maybeSingle: () => Promise.resolve(routeResult)
    };

    return {
      rpc: (name: string, args: unknown) => {
        rpc(name, args);

        return Promise.resolve(rpcResults[name] ?? { data: null, error: null });
      },
      from: (table: string) => (table === 'routes' ? routes : media)
    };
  }
}));

const ROUTE_ROW = {
  id: 'route-1',
  id_sector: 'sector-1',
  name: 'Pyrih',
  name_local: 'Пиріг',
  grade: '6c+',
  grade_scale: 'french',
  sectors: {
    name: 'Bastion',
    id_region: 'region-1',
    regions: { name: 'Dovbush' }
  }
};

const videoRow = (id: string, overrides: object = {}) => ({
  id,
  id_user: 'user-1',
  id_tick: null,
  id_youtube: `yt-${id.slice(-1)}`,
  title: 'Pyrih 6c+ redpoint',
  channel_name: null,
  published_at: null,
  created_at: '2026-10-01T10:00:00+00:00',
  users: { display_name: 'Olena' },
  routes: ROUTE_ROW,
  ...overrides
});

const pageOf = (ids: string[], total = ids.length): QueryResult => ({
  data: { total, ids },
  error: null
});

const oEmbedReplies = (reply: () => Promise<Response>) =>
  vi.stubGlobal('fetch', vi.fn(reply));

describe('VideosService', () => {
  const service = new VideosService();

  beforeEach(() => {
    rpc.mockClear();
    rpcResults = {};
    rowsResult = { data: [], error: null };
    routeResult = { data: null, error: null };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('findPage', () => {
    it('rejects a sort it does not know', async () => {
      await expect(
        service.findPage({ sort: 'random' as never })
      ).rejects.toMatchObject({ statusCode: 400, code: 'VIDEO_SORT_UNKNOWN' });
    });

    it('rejects a grade that is not on the french scale', async () => {
      await expect(service.findPage({ gradeFrom: 'V5' })).rejects.toMatchObject(
        { statusCode: 400, code: 'VIDEO_GRADE_UNKNOWN' }
      );
    });

    it('rejects a malformed cursor before querying', async () => {
      await expect(
        service.findPage({ cursor: 'not-a-cursor' })
      ).rejects.toMatchObject({ statusCode: 400 });
      expect(rpc).not.toHaveBeenCalled();
    });

    it.each([
      [undefined, 25],
      [0, 25],
      [-5, 2],
      [10, 11],
      [500, 61]
    ])('asks one row past a page of limit %s', async (limit, pageLimit) => {
      rpcResults.media_page = pageOf([]);

      await service.findPage({ limit });

      expect(rpc).toHaveBeenCalledWith(
        'media_page',
        expect.objectContaining({ page_limit: pageLimit })
      );
    });

    it('passes the trimmed term, the grade band and the direction', async () => {
      rpcResults.media_page = pageOf([]);

      await service.findPage({
        query: '  pyrih ',
        gradeFrom: '6a',
        gradeTo: '7a',
        sort: 'oldest',
        cursor: `2026-10-01T10:00:00.5+00:00|${ID_A}`
      });

      expect(rpc).toHaveBeenCalledWith('media_page', {
        term: 'pyrih',
        grade_min: expect.any(Number),
        grade_max: expect.any(Number),
        newest_first: false,
        cursor_created_at: '2026-10-01T10:00:00.5+00:00',
        id_cursor: ID_A,
        page_limit: 25
      });

      const { grade_min, grade_max } = rpc.mock.lastCall?.[1] ?? {};

      expect(grade_min).toBeLessThan(grade_max);
    });

    it('keeps the order the page was ranked in and drops vanished rows', async () => {
      rpcResults.media_page = pageOf([ID_B, ID_C, ID_A], 3);
      rowsResult = { data: [videoRow(ID_A), videoRow(ID_B)], error: null };

      const page = await service.findPage({});

      expect(page.items.map(({ id }) => id)).toEqual([ID_B, ID_A]);
      expect(page.total).toBe(3);
      expect(page.nextCursor).toBeNull();
    });

    it('cursors on the YouTube date where known, else on when it was linked', async () => {
      rpcResults.media_page = pageOf([ID_A, ID_B]);
      rowsResult = {
        data: [
          videoRow(ID_A, { published_at: '2024-05-01T00:00:00+00:00' }),
          videoRow(ID_B)
        ],
        error: null
      };

      const first = await service.findPage({ limit: 1 });

      expect(first.nextCursor).toBe(`2024-05-01T00:00:00+00:00|${ID_A}`);

      rowsResult = { data: [videoRow(ID_B), videoRow(ID_A)], error: null };
      rpcResults.media_page = pageOf([ID_B, ID_A]);

      const second = await service.findPage({ limit: 1 });

      expect(second.nextCursor).toBe(`2026-10-01T10:00:00+00:00|${ID_B}`);
    });

    it('maps a row to the gallery card', async () => {
      rpcResults.media_page = pageOf([ID_A]);
      rowsResult = {
        data: [videoRow(ID_A, { channel_name: 'Crag TV' })],
        error: null
      };

      const [video] = (await service.findPage({})).items;

      expect(video).toEqual({
        id: ID_A,
        idYoutube: 'yt-a',
        idUser: 'user-1',
        authorName: 'Olena',
        title: 'Pyrih 6c+ redpoint',
        channelName: 'Crag TV',
        publishedAt: null,
        idTick: null,
        createdAt: '2026-10-01T10:00:00+00:00',
        route: {
          idRoute: 'route-1',
          idSector: 'sector-1',
          idRegion: 'region-1',
          name: 'Pyrih',
          nameLocal: 'Пиріг',
          grade: '6c+',
          gradeScale: 'french',
          sectorName: 'Bastion',
          regionName: 'Dovbush'
        }
      });
    });

    it('reports a failed page read under its own code', async () => {
      rpcResults.media_page = { data: null, error: { message: 'boom' } };

      await expect(service.findPage({})).rejects.toMatchObject({
        statusCode: 500,
        code: 'VIDEOS_READ_FAILED'
      });
    });
  });

  describe('preview', () => {
    it('refuses a link that is not YouTube', async () => {
      oEmbedReplies(() => Promise.resolve(Response.json({})));

      await expect(
        service.preview('https://vimeo.com/123456')
      ).rejects.toMatchObject({ statusCode: 400, code: 'URL_UNSUPPORTED' });
      expect(fetch).not.toHaveBeenCalled();
    });

    it('reads the title and channel and guesses the route from the title', async () => {
      oEmbedReplies(() =>
        Promise.resolve(
          Response.json({ title: 'Pyrih 6c+', author_name: 'Crag TV' })
        )
      );
      rowsResult = { data: null, error: null };
      rpcResults.route_in_title = { data: 'route-1', error: null };
      routeResult = { data: ROUTE_ROW, error: null };

      const preview = await service.preview('https://youtu.be/dQw4w9WgXcQ');

      expect(preview).toMatchObject({
        idYoutube: 'dQw4w9WgXcQ',
        title: 'Pyrih 6c+',
        channelName: 'Crag TV',
        existing: null,
        suggestedRoute: { idRoute: 'route-1', idRegion: 'region-1' }
      });
      expect(rpc).toHaveBeenCalledWith('route_in_title', {
        title: 'Pyrih 6c+'
      });
    });

    it('guesses no route for a video the catalog already holds', async () => {
      oEmbedReplies(() => Promise.resolve(Response.json({ title: 'Pyrih' })));
      rowsResult = { data: videoRow(ID_A), error: null };

      const preview = await service.preview('https://youtu.be/dQw4w9WgXcQ');

      expect(preview.existing).toMatchObject({ id: ID_A });
      expect(preview.suggestedRoute).toBeNull();
      expect(rpc).not.toHaveBeenCalled();
    });

    it('guesses nothing when no single route is named in the title', async () => {
      oEmbedReplies(() => Promise.resolve(Response.json({ title: 'Send' })));
      rowsResult = { data: null, error: null };
      rpcResults.route_in_title = { data: null, error: null };

      const preview = await service.preview('https://youtu.be/dQw4w9WgXcQ');

      expect(preview.suggestedRoute).toBeNull();
    });

    it.each([
      [
        'answers not ok',
        () => Promise.resolve(new Response('', { status: 401 }))
      ],
      ['throws', () => Promise.reject(new Error('timeout'))]
    ])('still previews the link when oEmbed %s', async (_, reply) => {
      oEmbedReplies(reply);
      rowsResult = { data: null, error: null };

      const preview = await service.preview('https://youtu.be/dQw4w9WgXcQ');

      expect(preview).toEqual({
        idYoutube: 'dQw4w9WgXcQ',
        title: null,
        channelName: null,
        suggestedRoute: null,
        existing: null
      });
      expect(rpc).not.toHaveBeenCalled();
    });
  });
});
