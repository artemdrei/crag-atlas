import { ValidationException } from '../exceptions/app.exception';

// Kept character-for-character in step with the `check` constraint in
// `002_catalog.sql` and with `toLatin.ts` on the web side.
const LATIN_NAME = /^[ -ɏḀ-ỿ–—‘’]+$/;

export const isLatinName = (name: string): boolean => LATIN_NAME.test(name);

export const toLatinName = (
  name: string | undefined,
  entity: string
): string => {
  const trimmed = name?.trim() ?? '';

  if (!trimmed) {
    throw new ValidationException('A name is required', `${entity}_NAME_EMPTY`);
  }

  if (!isLatinName(trimmed)) {
    throw new ValidationException(
      'A name is written in the Latin alphabet; the local spelling goes in the local name',
      `${entity}_NAME_NOT_LATIN`
    );
  }

  return trimmed;
};

export const toLocalName = (name?: string | null): string | null =>
  name?.trim() || null;
