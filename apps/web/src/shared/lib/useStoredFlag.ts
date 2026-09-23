import { useState } from 'react';

export const useStoredFlag = (storageKey: string, fallback: boolean) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);

      return stored === null ? fallback : stored === 'true';
    } catch {
      return fallback;
    }
  });

  const toggle = () =>
    setValue((previous) => {
      const next = !previous;

      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}

      return next;
    });

  return { value, toggle };
};
