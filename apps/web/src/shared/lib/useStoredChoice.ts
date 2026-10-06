import { useState } from 'react';

export const useStoredChoice = <T extends string>(
  storageKey: string,
  choices: readonly T[],
  fallback: T
) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as T | null;

      return stored !== null && choices.includes(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  });

  const change = (next: T) => {
    setValue(next);

    try {
      localStorage.setItem(storageKey, next);
    } catch {}
  };

  return [value, change] as const;
};
