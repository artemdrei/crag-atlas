import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiDelete, apiPost, QUERY_KEYS } from '@web/shared/api';
import { toast } from '@web/shared/lib';

import type { ContentScope } from './useApiGetClimberContent';

export type ArchiveAction = 'archive' | 'restore' | 'erase';

const PATH: Record<ArchiveAction, (base: string) => string> = {
  archive: (base) => base,
  restore: (base) => `${base}/restore`,
  erase: (base) => `${base}/permanent`
};

export interface Params<T> {
  scope: ContentScope;
  onDone?: (data: T) => void;
}

export const useApiArchiveAction = <T = unknown>(
  action: ArchiveAction,
  { scope, onDone }: Params<T>
) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (id: string) => {
      const path = PATH[action](`/${scope}/${id}`);

      return action === 'restore'
        ? apiPost<T>(path, {})
        : (apiDelete(path) as Promise<T>);
    },
    onSuccess: (data) => {
      // isArchived is derived from a row's ancestors, so archiving anything
      // changes the flag on everything under it.
      for (const queryKey of [
        QUERY_KEYS.regions(),
        QUERY_KEYS.sectors(),
        QUERY_KEYS.routes(),
        QUERY_KEYS.climberContents()
      ]) {
        queryClient.invalidateQueries({ queryKey });
      }

      onDone?.(data);
    },
    onError: (error) => toast.error(resolveFailureMessage(toFailure(error)))
  });

  return { isPending, run: mutate };
};
