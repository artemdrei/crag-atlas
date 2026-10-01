import { type Failure, toFailure } from '@crag-atlas/utils';
import { useQuery } from '@tanstack/react-query';

export interface Params<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

// Deliberately thin: anything needing more of react-query calls `useQuery`
// directly rather than grow this into a second framework.
export const useApiQuery = <T>({ queryKey, queryFn, enabled }: Params<T>) => {
  // isPending, not isLoading: a cached query refetching in the background must
  // not re-render the loading state.
  const { data, isPending, error } = useQuery({ queryKey, queryFn, enabled });

  return {
    data,
    isLoading: enabled === false ? false : isPending,
    failure: error ? (toFailure(error) as Failure) : null
  };
};
