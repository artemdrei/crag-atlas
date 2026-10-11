import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

import {
  VIDEO_FILTER_PARAMS,
  VIDEO_SORTS,
  type VideoFilters,
  type VideoSort
} from '../entities';

const oneOf = <T extends string>(
  options: readonly [T, ...T[]],
  value: string | null
): T => (options.includes(value as T) ? (value as T) : options[0]);

const DEFAULTS: Record<keyof VideoFilters, string> = {
  query: '',
  gradeFrom: '',
  gradeTo: '',
  sort: 'newest'
};

export const useVideoFilters = () => {
  const [params, setParams] = useSearchParams();

  const filters: VideoFilters = {
    query: params.get(VIDEO_FILTER_PARAMS.query) ?? '',
    gradeFrom: params.get(VIDEO_FILTER_PARAMS.gradeFrom) ?? '',
    gradeTo: params.get(VIDEO_FILTER_PARAMS.gradeTo) ?? '',
    sort: oneOf<VideoSort>(VIDEO_SORTS, params.get(VIDEO_FILTER_PARAMS.sort))
  };

  // A filter change drops `added`: the highlighted card may no longer be
  // first, or there at all.
  const changeFilters = useCallback(
    (next: Partial<VideoFilters>) => {
      setParams(
        (current) => {
          current.delete(VIDEO_FILTER_PARAMS.added);

          for (const [key, value] of Object.entries(next)) {
            const name = VIDEO_FILTER_PARAMS[key as keyof VideoFilters];

            if (value === DEFAULTS[key as keyof VideoFilters]) {
              current.delete(name);
            } else {
              current.set(name, value);
            }
          }

          return current;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  return {
    filters,
    idAdded: params.get(VIDEO_FILTER_PARAMS.added),
    changeFilters
  };
};
