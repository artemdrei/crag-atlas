import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export const useSearchParamList = (
  key: string
): [string[], (values: string[]) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const raw = searchParams.get(key);

  const values = useMemo(
    () => (raw ? raw.split(',').filter(Boolean) : []),
    [raw]
  );

  // Pushed, not replaced: the address is the filter, so Back steps through.
  const setValues = useCallback(
    (next: string[]) => {
      setSearchParams((params) => {
        if (next.length === 0) {
          params.delete(key);
        } else {
          params.set(key, next.join(','));
        }

        return params;
      });
    },
    [key, setSearchParams]
  );

  return [values, setValues];
};
