import type { DownloadProgress } from '../entities';

export const progressPercentOf = (
  progress: Pick<DownloadProgress, 'done' | 'total'> | null | undefined
): number | null =>
  progress?.total ? (progress.done / progress.total) * 100 : null;
