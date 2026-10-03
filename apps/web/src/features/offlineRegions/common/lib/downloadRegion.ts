import type { Region, Route, Sector, Topo } from '@crag-atlas/api';

import { apiGet, apiUrl } from '@web/shared/api';

import type { DownloadProgress, OfflineRegion } from '../entities';
import { mapWithConcurrency } from './mapWithConcurrency';
import {
  OFFLINE_CACHE_NAME,
  readOfflineRegions,
  runExclusive,
  saveOfflineRegion
} from './offlineStore';
import { warmAppForOffline } from './warmAppForOffline';

// The API runs on a small instance; a region with dozens of sectors must not
// arrive as one burst.
const CONCURRENCY = 4;

const collectResponses = async (idRegion: string) => {
  const responses = new Map<string, unknown>();

  const fetchAndKeep = async <T>(path: string) => {
    const data = await apiGet<T>(path);

    responses.set(apiUrl(path), data);

    return data;
  };

  const [region, sectors] = await Promise.all([
    fetchAndKeep<Region>(`/regions/${idRegion}`),
    fetchAndKeep<Sector[]>(`/regions/${idRegion}/sectors`),
    fetchAndKeep(`/regions/${idRegion}/sectors/ticked`)
  ]);
  const photoUrls = [region.photoUrl, ...sectors.map((s) => s.photoUrl)];

  await mapWithConcurrency(sectors, CONCURRENCY, async (sector) => {
    responses.set(apiUrl(`/sectors/${sector.id}`), sector);

    const [routes, topos] = await Promise.all([
      fetchAndKeep<Route[]>(`/sectors/${sector.id}/routes`),
      fetchAndKeep<Topo[]>(`/sectors/${sector.id}/topos`),
      fetchAndKeep(`/sectors/${sector.id}/routes/ticked`)
    ]);

    // The list and the detail endpoint return the same shape, so a route page
    // needs no request of its own.
    for (const route of routes) {
      responses.set(apiUrl(`/routes/${route.id}`), route);
    }

    photoUrls.push(...topos.map((topo) => topo.photoUrl));
  });

  return {
    region,
    responses,
    photoUrls: [...new Set(photoUrls.filter((url): url is string => !!url))]
  };
};

const saveRegion = async (
  idRegion: string,
  onProgress: (progress: DownloadProgress) => void
): Promise<OfflineRegion> => {
  await warmAppForOffline();

  const { region, responses, photoUrls } = await collectResponses(idRegion);
  const previous = (await readOfflineRegions())[idRegion];
  const urls = [...responses.keys(), ...photoUrls];
  const cache = await caches.open(OFFLINE_CACHE_NAME);
  let bytes = 0;
  let done = 0;

  onProgress({ done, total: photoUrls.length });

  try {
    for (const [url, data] of responses) {
      const body = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      });

      bytes += body.size;
      await cache.put(url, new Response(body));
    }

    await mapWithConcurrency(photoUrls, CONCURRENCY, async (url) => {
      const response = await fetch(url);

      if (!response.ok) throw new Error(`${url} answered ${response.status}`);

      bytes += (await response.clone().blob()).size;
      await cache.put(url, response);
      onProgress({ done: ++done, total: photoUrls.length });
    });
  } catch (error) {
    const kept = new Set(previous?.urls);

    await Promise.all(
      urls.filter((url) => !kept.has(url)).map((url) => cache.delete(url))
    );

    throw error;
  }

  const current = new Set(urls);

  await Promise.all(
    (previous?.urls ?? [])
      .filter((url) => !current.has(url))
      .map((url) => cache.delete(url))
  );

  const offlineRegion = {
    id: idRegion,
    name: region.name,
    urls,
    bytes,
    savedAt: Date.now()
  };

  await saveOfflineRegion(offlineRegion);

  return offlineRegion;
};

export const downloadRegion = (
  idRegion: string,
  onProgress: (progress: DownloadProgress) => void
) => runExclusive(() => saveRegion(idRegion, onProgress));

// A background refresh must not bring back a region deleted, or wiped by a
// sign-out, while it waited in the queue.
export const refreshRegion = (idRegion: string) =>
  runExclusive(async () => {
    if (!(await readOfflineRegions())[idRegion]) return;

    await saveRegion(idRegion, () => {});
  });
