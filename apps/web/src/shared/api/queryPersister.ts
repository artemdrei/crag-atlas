import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';

export const QUERY_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get<string>(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key)
  },
  key: 'crag-atlas-query-cache'
});
