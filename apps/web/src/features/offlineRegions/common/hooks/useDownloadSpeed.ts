import { useEffect, useState } from 'react';

import type { DownloadProgress } from '../entities';

const TICK_MS = 1000;
const WARM_UP_MS = 3000;
const SLOW_BYTES_PER_SECOND = 100 * 1024;

export const useDownloadSpeed = (progress: DownloadProgress | null) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!progress) return;

    const timer = setInterval(() => setNow(Date.now()), TICK_MS);

    return () => clearInterval(timer);
  }, [progress]);

  if (!progress) return { bytesPerSecond: null, isSlow: false };

  const elapsedMs = Math.max(now, Date.now()) - progress.startedAt;
  const bytesPerSecond =
    elapsedMs > 0 ? (progress.bytes * 1000) / elapsedMs : null;

  return {
    bytesPerSecond,
    isSlow:
      elapsedMs >= WARM_UP_MS &&
      bytesPerSecond !== null &&
      bytesPerSecond < SLOW_BYTES_PER_SECOND
  };
};
