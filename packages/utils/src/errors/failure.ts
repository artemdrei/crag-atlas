export type Failure =
  | { kind: 'network'; message: string; cause?: unknown }
  | { kind: 'validation'; message: string; field?: string; code?: string }
  | {
      kind: 'domain';
      code: string;
      message: string;
      meta?: Record<string, unknown>;
    }
  | { kind: 'unknown'; message: string; cause?: unknown };

export const networkFailure = (message: string, cause?: unknown): Failure => ({
  kind: 'network',
  message,
  cause
});

export const validationFailure = (
  message: string,
  field?: string,
  code?: string
): Failure => ({
  kind: 'validation',
  message,
  field,
  code
});

export const domainFailure = (
  code: string,
  message: string,
  meta?: Record<string, unknown>
): Failure => ({
  kind: 'domain',
  code,
  message,
  meta
});

export const unknownFailure = (message: string, cause?: unknown): Failure => ({
  kind: 'unknown',
  message,
  cause
});

export const isFailure = (value: unknown): value is Failure => {
  if (typeof value !== 'object' || value === null || !('kind' in value)) {
    return false;
  }

  const kind = (value as { kind: unknown }).kind;

  return (
    kind === 'network' ||
    kind === 'validation' ||
    kind === 'domain' ||
    kind === 'unknown'
  );
};
