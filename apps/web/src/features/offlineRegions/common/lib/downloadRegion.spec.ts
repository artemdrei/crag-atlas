import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadRegion, refreshRegion } from './downloadRegion';
import {
  deleteAllOfflineRegions,
  deleteOfflineRegion,
  readOfflineRegions
} from './offlineStore';

const API = 'https://api.test';
const PHOTO = 'https://photos.test';

let catalog: Record<string, unknown>;
let failingPhoto: string | null;
const store = new Map<string, unknown>();
const cached = new Map<string, Response>();

vi.mock('@web/shared/api', () => ({
  apiUrl: (path: string) => `${API}${path}`,
  apiGet: async (path: string) => {
    if (!(path in catalog)) throw new Error(`unexpected ${path}`);

    return catalog[path];
  }
}));

vi.mock('idb-keyval', () => ({
  get: async (key: string) => store.get(key),
  del: async (key: string) => store.delete(key),
  update: async (key: string, fn: (value: unknown) => unknown) =>
    store.set(key, fn(store.get(key)))
}));

const buildCatalog = (routes: string[]) => ({
  '/regions/r1': { id: 'r1', name: 'Céüse', photoUrl: `${PHOTO}/region.jpg` },
  '/regions/r1/sectors': [{ id: 's1', name: 'Biographie', photoUrl: null }],
  '/regions/r1/sectors/ticked': [],
  '/sectors/s1/routes': routes.map((id) => ({ id, name: id })),
  '/sectors/s1/routes/ticked': [],
  '/sectors/s1/topos': [
    { id: 't1', photoUrl: `${PHOTO}/topo.jpg` },
    { id: 't2', photoUrl: `${PHOTO}/region.jpg` }
  ]
});

beforeEach(() => {
  store.clear();
  cached.clear();
  failingPhoto = null;
  catalog = buildCatalog(['a', 'b']);

  vi.stubGlobal('caches', {
    delete: async () => cached.clear(),
    open: async () => ({
      put: async (url: string, response: Response) => {
        cached.set(url, response);
      },
      delete: async (url: string) => cached.delete(url)
    })
  });
  vi.stubGlobal('fetch', async (url: string) =>
    url === failingPhoto
      ? new Response(null, { status: 500 })
      : new Response('jpeg')
  );
});

const urlsOf = () => [...cached.keys()].sort();

const sizeOf = (data: unknown) => new Blob([JSON.stringify(data)]).size;

// Every catalog response, a detail copy of each sector and route, and the two
// distinct photos of four bytes each.
const expectedBytes = () => {
  const sectors = catalog['/regions/r1/sectors'] as unknown[];
  const routes = catalog['/sectors/s1/routes'] as unknown[];

  return (
    Object.values(catalog).reduce<number>(
      (sum, data) => sum + sizeOf(data),
      0
    ) +
    [...sectors, ...routes].reduce<number>(
      (sum, data) => sum + sizeOf(data),
      0
    ) +
    2 * 'jpeg'.length
  );
};

describe('downloadRegion', () => {
  it('saves the region, a detail entry per route and each photo once', async () => {
    const region = await downloadRegion('r1', () => {});

    expect(urlsOf()).toEqual(
      [
        `${API}/regions/r1`,
        `${API}/regions/r1/sectors`,
        `${API}/regions/r1/sectors/ticked`,
        `${API}/routes/a`,
        `${API}/routes/b`,
        `${API}/sectors/s1`,
        `${API}/sectors/s1/routes`,
        `${API}/sectors/s1/routes/ticked`,
        `${API}/sectors/s1/topos`,
        `${PHOTO}/region.jpg`,
        `${PHOTO}/topo.jpg`
      ].sort()
    );
    expect(region.name).toBe('Céüse');
    expect(region.bytes).toBe(expectedBytes());
    expect((await readOfflineRegions()).r1?.urls).toHaveLength(11);
  });

  it('drops what a refresh no longer finds in the region', async () => {
    await downloadRegion('r1', () => {});
    catalog = buildCatalog(['a']);

    await downloadRegion('r1', () => {});

    expect(cached.has(`${API}/routes/b`)).toBe(false);
    expect(cached.has(`${API}/routes/a`)).toBe(true);
  });

  it('keeps the previous copy and removes the new leftovers when a photo fails', async () => {
    await downloadRegion('r1', () => {});
    catalog = buildCatalog(['a', 'b', 'c']);
    failingPhoto = `${PHOTO}/topo.jpg`;

    await expect(downloadRegion('r1', () => {})).rejects.toThrow();

    expect(cached.has(`${API}/routes/c`)).toBe(false);
    expect(cached.has(`${API}/routes/b`)).toBe(true);
    expect((await readOfflineRegions()).r1?.urls).not.toContain(
      `${API}/routes/c`
    );
  });

  it('does not bring back a region deleted while it was downloading', async () => {
    const download = downloadRegion('r1', () => {});
    const removal = deleteOfflineRegion('r1');

    await Promise.all([download, removal]);

    expect((await readOfflineRegions()).r1).toBeUndefined();
    expect(cached.size).toBe(0);
  });

  it('skips a background refresh of a region wiped by sign-out', async () => {
    await downloadRegion('r1', () => {});

    await Promise.all([deleteAllOfflineRegions(), refreshRegion('r1')]);

    expect((await readOfflineRegions()).r1).toBeUndefined();
    expect(cached.size).toBe(0);
  });
});
