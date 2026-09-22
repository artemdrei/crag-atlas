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

  const setValues = useCallback(
    (next: string[]) => {
      setSearchParams(
        (params) => {
          if (next.length === 0) {
            params.delete(key);
          } else {
            params.set(key, next.join(','));
          }

          return params;
        },
        { replace: true }
      );
    },
    [key, setSearchParams]
  );

  return [values, setValues];
};
