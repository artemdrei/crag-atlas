import { ValidationException } from '../exceptions/app.exception';

// Latin blocks plus the punctuation and digits a name may carry. Kept
// character-for-character in step with the `check` constraint in
// `002_catalog.sql`: a looser column would let a name through that the
// next edit refuses, a stricter one would answer with a write error nobody
// can read.
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

// The name in its own writing system. Optional, and an empty box means the
// Latin name is the only one there is.
export const toLocalName = (name?: string | null): string | null =>
  name?.trim() || null;
