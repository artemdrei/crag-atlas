import type { SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { gradeScore } from '../common/utils/grade';
import {
  assertLocalStack,
  authenticatedClient,
  serviceClient
} from '../common/utils/localSupabase';
import { MediaService } from './media.service';
import { VideosService } from './videos.service';

const tokenOf = async (client: SupabaseClient): Promise<string> => {
  const { data } = await client.auth.getSession();

  if (!data.session) throw new Error('The test user has no session');

  return data.session.access_token;
};

const uniqueIdYoutube = () =>
  `int${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

// The catalog is shared with every other suite, so each assertion is scoped
// by a tag no other row can carry.
describe('the video gallery', () => {
  const db = serviceClient();
  const videos = new VideosService();
  const media = new MediaService();
  const tag = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  const ids = { region: '', sector: '', easy: '', hard: '' };
  let authUser: AuthUser;
  let client: SupabaseClient;

  const insert = async (table: string, row: object): Promise<string> => {
    const { data, error } = await db
      .from(table)
      .insert(row)
      .select('id')
      .single();

    if (error) throw new Error(`${table}: ${error.message}`);

    return data.id as string;
  };

  const route = (name: string, grade: string, idSector = ids.sector) =>
    insert('routes', {
      id_sector: idSector,
      name,
      grade,
      grade_scale: 'french',
      grade_score: gradeScore(grade, 'french'),
      type: 'sport'
    });

  const video = (idRoute: string, publishedAt: string | null) =>
    insert('route_media', {
      id_route: idRoute,
      id_user: authUser.idUser,
      kind: 'video',
      url: `https://youtu.be/${uniqueIdYoutube()}`,
      title: '',
      published_at: publishedAt
    });

  beforeAll(async () => {
    assertLocalStack();

    const signedIn = await authenticatedClient();

    client = signedIn.client;
    authUser = { idUser: signedIn.idUser, accessToken: await tokenOf(client) };
    ids.region = await insert('regions', {
      name: `INT-Gallery-${tag}`,
      rock_type: 'limestone'
    });
    ids.sector = await insert('sectors', {
      id_region: ids.region,
      name: `INT-Gallery-${tag}`
    });
    ids.easy = await route(`Gallery ${tag} Easy`, '6a');
    ids.hard = await route(`Gallery ${tag} Hard`, '7b');
  });

  afterAll(async () => {
    await db.from('route_media').delete().in('id_route', [ids.easy, ids.hard]);
    await db.from('regions').delete().eq('id', ids.region);
    await db.auth.admin.deleteUser(authUser.idUser);
  });

  describe('paging', () => {
    const order = { linkedOnly: '', recent: '', old: '' };

    beforeAll(async () => {
      order.old = await video(ids.easy, '2020-01-01T00:00:00+00:00');
      order.recent = await video(ids.easy, '2025-06-01T00:00:00+00:00');
      // Linked today with no YouTube date: it sorts by when it was linked.
      order.linkedOnly = await video(ids.easy, null);
    });

    const walk = async (sort: 'newest' | 'oldest') => {
      const seen: string[] = [];
      let cursor: string | undefined;

      do {
        const page = await videos.findPage({
          query: `${tag} Easy`,
          sort,
          limit: 2,
          cursor
        });

        expect(page.total).toBe(3);
        seen.push(...page.items.map(({ id }) => id));
        cursor = page.nextCursor ?? undefined;
      } while (cursor);

      return seen;
    };

    it('walks newest first through every video once', async () => {
      expect(await walk('newest')).toEqual([
        order.linkedOnly,
        order.recent,
        order.old
      ]);
    });

    it('walks oldest first through every video once', async () => {
      expect(await walk('oldest')).toEqual([
        order.old,
        order.recent,
        order.linkedOnly
      ]);
    });
  });

  describe('filters', () => {
    let hard = '';

    beforeAll(async () => {
      hard = await video(ids.hard, null);
    });

    it('narrows to the grade band', async () => {
      const page = await videos.findPage({ query: tag, gradeFrom: '7a' });

      expect(page.items.map(({ id }) => id)).toEqual([hard]);
    });

    it('finds a video by its route name, whatever the case', async () => {
      const page = await videos.findPage({ query: `GALLERY ${tag} HARD` });

      expect(page.items.map(({ id }) => id)).toEqual([hard]);
    });
  });

  describe('a duplicate link', () => {
    it('is refused however the same video is written', async () => {
      const idYoutube = uniqueIdYoutube();

      await media.create(authUser, ids.easy, {
        kind: 'video',
        url: `https://www.youtube.com/watch?v=${idYoutube}`
      });

      await expect(
        media.create(authUser, ids.hard, {
          kind: 'video',
          url: `https://youtu.be/${idYoutube}?t=42`
        })
      ).rejects.toMatchObject({ statusCode: 409, code: 'MEDIA_DUPLICATE' });
    });

    it('is not a video link at all when it is not YouTube', async () => {
      await expect(
        media.create(authUser, ids.easy, {
          kind: 'video',
          url: 'https://vimeo.com/123456'
        })
      ).rejects.toMatchObject({ statusCode: 400, code: 'URL_UNSUPPORTED' });
    });
  });

  describe('what a climber may write', () => {
    const row = (extra: object) => ({
      id_route: ids.easy,
      id_user: authUser.idUser,
      kind: 'video',
      url: `https://youtu.be/${uniqueIdYoutube()}`,
      title: '',
      ...extra
    });

    it('may not write the YouTube id itself', async () => {
      const { error } = await client
        .from('route_media')
        .insert(row({ id_youtube: uniqueIdYoutube() }));

      expect(error?.code).toBe('42501');
    });

    it('gets the YouTube id read from the link', async () => {
      const idYoutube = uniqueIdYoutube();
      const created = await media.create(authUser, ids.easy, {
        kind: 'video',
        url: `https://m.youtube.com/shorts/${idYoutube}`
      });

      const { data } = await db
        .from('route_media')
        .select('id_youtube')
        .eq('id', created.id)
        .single();

      expect(data?.id_youtube).toBe(idYoutube);
    });

    it('leaves the channel and publish date to imports', async () => {
      const { error } = await client
        .from('route_media')
        .insert(row({ published_at: '2020-01-01T00:00:00+00:00' }));

      expect(error?.code).toBe('42501');
    });
  });
});

describe('route_in_title', () => {
  const db = serviceClient();
  const tag = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
  const ids = { region: '', sector: '', twin: '', short: '', long: '' };

  const insert = async (table: string, row: object): Promise<string> => {
    const { data, error } = await db
      .from(table)
      .insert(row)
      .select('id')
      .single();

    if (error) throw new Error(`${table}: ${error.message}`);

    return data.id as string;
  };

  const route = (name: string, idSector: string) =>
    insert('routes', {
      id_sector: idSector,
      name,
      grade: '6a',
      grade_scale: 'french',
      grade_score: gradeScore('6a', 'french'),
      type: 'sport'
    });

  const guess = async (title: string) => {
    const { data, error } = await db.rpc('route_in_title', { title });

    if (error) throw new Error(error.message);

    return data as string | null;
  };

  beforeAll(async () => {
    assertLocalStack();

    ids.region = await insert('regions', {
      name: `INT-Title-${tag}`,
      rock_type: 'limestone'
    });
    ids.sector = await insert('sectors', {
      id_region: ids.region,
      name: `INT-Title-${tag}`
    });
    ids.twin = await insert('sectors', {
      id_region: ids.region,
      name: `INT-Title-Twin-${tag}`
    });
    ids.short = await route(`Arch ${tag}`, ids.sector);
    ids.long = await route(`Arch ${tag} Direct`, ids.sector);
  });

  afterAll(async () => {
    await db.from('regions').delete().eq('id', ids.region);
  });

  it('picks the longest route name the title carries', async () => {
    expect(await guess(`Sent arch ${tag} direct 6a+ today`)).toBe(ids.long);
  });

  it('picks the only name the title carries', async () => {
    expect(await guess(`Arch ${tag} onsight`)).toBe(ids.short);
  });

  it('guesses nothing when two routes share the name', async () => {
    const twin = await route(`Arch ${tag}`, ids.twin);

    expect(await guess(`Arch ${tag} onsight`)).toBeNull();

    await db.from('routes').delete().eq('id', twin);
  });

  it('skips a deleted route', async () => {
    await db
      .from('routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', ids.long);

    expect(await guess(`Arch ${tag} direct`)).toBe(ids.short);

    await db.from('routes').update({ deleted_at: null }).eq('id', ids.long);
  });
});
