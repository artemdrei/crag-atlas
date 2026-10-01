// Same set the API and the column check accept — all three must stay in step.
const LATIN_NAME = /^[ -ɏḀ-ỿ–—‘’]+$/;

export const isLatinName = (name: string): boolean => LATIN_NAME.test(name);

export const isNameLatin = (name: string): boolean =>
  !name.trim() || isLatinName(name.trim());

let transliterate: ((value: string) => string) | undefined;

// The charmap is ~190 KB and only an editor typing a non-Latin name needs it.
export const loadTransliteration = async (): Promise<void> => {
  transliterate ??= (await import('transliteration')).transliterate;
};

// A name that already is Latin comes back untouched: the library would strip
// its diacritics, and Céüse is not Ceuse. An empty name counts as Latin, so
// `followLatin` does not wait on a charmap it has no use for.
export const toLatin = (value: string): string | undefined =>
  isNameLatin(value) ? value : transliterate?.(value);

// The Latin name follows the local one only while it still reads as the
// transliteration of what the other box holds.
export const followLatin = (
  name: string,
  nameLocal: string,
  nextLocal: string
): { name: string; nameLocal: string } => {
  const followed = toLatin(nameLocal);

  return followed !== undefined && name === followed
    ? { name: toLatin(nextLocal) ?? name, nameLocal: nextLocal }
    : { name, nameLocal: nextLocal };
};

// undefined while the charmap has not arrived and nothing can be told yet.
export const isFollowingLatin = (
  name: string,
  nameLocal: string
): boolean | undefined => {
  const followed = toLatin(nameLocal);

  return followed === undefined ? undefined : followed === name;
};
