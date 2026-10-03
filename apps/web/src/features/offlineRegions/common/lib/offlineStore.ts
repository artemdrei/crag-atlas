import { del, get, update } from 'idb-keyval';

import type { OfflineRegion } from '../entities';

// The service worker reads this cache by name: see runtimeCaching in
// vite.config.ts.
export const OFFLINE_CACHE_NAME = 'offline-regions';

const INDEX_KEY = 'offline-regions';

type Index = Record<string, OfflineRegion>;

let queue: Promise<unknown> = Promise.resolve();

// Downloads, deletes and the sign-out wipe touch one cache and one index; run
// side by side, a delete would be undone by a refresh saving after it.
export const runExclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task);

  queue = run.catch(() => {});

  return run;
};

export const readOfflineRegions = async (): Promise<Index> =>
  (await get<Index>(INDEX_KEY)) ?? {};

export const saveOfflineRegion = (region: OfflineRegion) =>
  update<Index>(INDEX_KEY, (index) => ({ ...index, [region.id]: region }));

export const deleteOfflineRegion = (idRegion: string) =>
  runExclusive(async () => {
    const region = (await readOfflineRegions())[idRegion];

    if (!region) return;

    const cache = await caches.open(OFFLINE_CACHE_NAME);

    await Promise.all(region.urls.map((url) => cache.delete(url)));
    await update<Index>(INDEX_KEY, (index) => {
      const { [idRegion]: _, ...rest } = index ?? {};

      return rest;
    });
  });

export const deleteAllOfflineRegions = () =>
  runExclusive(async () => {
    await caches.delete(OFFLINE_CACHE_NAME);
    await del(INDEX_KEY);
  });
