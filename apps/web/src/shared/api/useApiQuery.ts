import { type Failure, toFailure } from '@crag-atlas/utils';
import { useQuery } from '@tanstack/react-query';

export interface Params<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
}

/**
 * The one place a query result turns into the app's `{ isLoading, failure }`
 * shape, so every page keeps working with `ApiFeedback`. Deliberately thin:
 * anything that needs more of react-query's options should call `useQuery`
 * directly rather than grow this into a second framework.
 */
export const useApiQuery = <T>({ queryKey, queryFn, enabled }: Params<T>) => {
  // isPending, not isLoading: a cached query that is refetching in the
  // background must not re-render the loading state — that is the flash.
  const { data, isPending, error } = useQuery({ queryKey, queryFn, enabled });

  return {
    data,
    isLoading: enabled === false ? false : isPending,
    failure: error ? (toFailure(error) as Failure) : null
  };
};
