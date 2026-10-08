import { useSyncExternalStore } from 'react';

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  saveData?: boolean;
}

const SLOW_EFFECTIVE_TYPES = new Set(['slow-2g', '2g', '3g']);

const connectionOf = () =>
  (navigator as Navigator & { connection?: NetworkInformation }).connection;

const subscribe = (onChange: () => void) => {
  const connection = connectionOf();

  connection?.addEventListener('change', onChange);

  return () => connection?.removeEventListener('change', onChange);
};

const snapshot = () => {
  const connection = connectionOf();

  if (!connection) return null;

  return (
    !!connection.saveData ||
    SLOW_EFFECTIVE_TYPES.has(connection.effectiveType ?? '')
  );
};

// Safari has no Network Information API: null there, so the caller can fall
// back to the speed it measures itself.
export const useConnectionHint = () =>
  useSyncExternalStore(subscribe, snapshot);
