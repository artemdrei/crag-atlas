import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

type Flags<K extends string> = Record<K, boolean>;

// Several keys share one hook because they have to share one write: every
// updater react-router hands out — functional form included — carries the
// params of the render it came from, so two setters called in one handler
// would each undo the other's key.
export const useSearchParamFlags = <K extends string>(
  keys: readonly K[]
): [Flags<K>, (next: Partial<Flags<K>>) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const flags = Object.fromEntries(
    keys.map((key) => [key, searchParams.get(key) === '1'])
  ) as Flags<K>;

  const setFlags = useCallback(
    (next: Partial<Flags<K>>) => {
      setSearchParams(
        (params) => {
          for (const [key, isOn] of Object.entries(next)) {
            if (isOn) {
              params.set(key, '1');
            } else {
              params.delete(key);
            }
          }

          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return [flags, setFlags];
};
