import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { invalidateRouteLists } from './invalidateRouteLists';
import { QUERY_KEYS } from './queryKeys';

const isStale = (client: QueryClient, key: readonly unknown[]) =>
  client.getQueryState(key)?.isInvalidated ?? false;

describe('invalidateRouteLists', () => {
  it('refreshes every list a route row shows up in, and nothing else', async () => {
    const client = new QueryClient();
    const refreshed = [
      QUERY_KEYS.sectorList('r1', false),
      QUERY_KEYS.sectorsTicked('r1'),
      QUERY_KEYS.routeList('s1', false),
      QUERY_KEYS.routesTicked('s1')
    ];
    const kept = [
      QUERY_KEYS.region('r1'),
      QUERY_KEYS.sector('s1'),
      QUERY_KEYS.topos('s1'),
      QUERY_KEYS.sectorConditions('s1')
    ];

    for (const key of [...refreshed, ...kept]) client.setQueryData(key, []);

    await invalidateRouteLists(client);

    expect(refreshed.filter((key) => !isStale(client, key))).toEqual([]);
    expect(kept.filter((key) => isStale(client, key))).toEqual([]);
  });
});
