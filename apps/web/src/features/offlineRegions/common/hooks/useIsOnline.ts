import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  addEventListener('online', onChange);
  addEventListener('offline', onChange);

  return () => {
    removeEventListener('online', onChange);
    removeEventListener('offline', onChange);
  };
};

export const useIsOnline = () =>
  useSyncExternalStore(subscribe, () => navigator.onLine);
