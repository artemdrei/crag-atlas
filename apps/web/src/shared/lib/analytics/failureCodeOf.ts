import { toFailure } from '@crag-atlas/utils';

export const failureCodeOf = (error: unknown): string => {
  const failure = toFailure(error);

  return 'code' in failure && failure.code ? failure.code : failure.kind;
};
