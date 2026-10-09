export interface PersistedStore<T extends object> {
  get: () => T;
  subscribe: (onChange: () => void) => () => void;
  write: (patch: Partial<T>) => void;
}

export const createPersistedStore = <T extends object>(
  storageKey: string,
  empty: T
): PersistedStore<T> => {
  const listeners = new Set<() => void>();
  let cached: T | null = null;

  const load = (): T => {
    try {
      const raw = localStorage.getItem(storageKey);

      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      return empty;
    }
  };

  const get = (): T => {
    cached ??= load();

    return cached;
  };

  return {
    get,
    subscribe: (onChange) => {
      listeners.add(onChange);

      return () => {
        listeners.delete(onChange);
      };
    },
    write: (patch) => {
      cached = { ...get(), ...patch };

      try {
        localStorage.setItem(storageKey, JSON.stringify(cached));
      } catch {}

      for (const listener of listeners) listener();
    }
  };
};
