// Same set the API and the column check accept: the Latin blocks plus the
// punctuation and digits a name carries.
const LATIN_NAME = /^[ -ɏḀ-ỿ–—‘’]+$/;

export const isLatinName = (name: string): boolean => LATIN_NAME.test(name);

export const isNameLatin = (name: string): boolean =>
  !name.trim() || isLatinName(name.trim());

let transliterate: ((value: string) => string) | undefined;

// The charmap is ~190 KB and only an editor typing a non-Latin name ever
// needs it, so it is fetched on demand rather than from the entry chunk.
export const loadTransliteration = async (): Promise<void> => {
  transliterate ??= (await import('transliteration')).transliterate;
};

/**
 * A name in any writing system, rewritten in Latin — or undefined while the
 * charmap has not arrived yet. A name that already is Latin comes back
 * untouched: the library would strip its diacritics, and Céüse is not Ceuse.
 *
 * An empty name is Latin as much as any other, and answering `undefined` for
 * it made `followLatin` wait on a charmap it had no use for: the first letter
 * typed into an empty pair decided whether the Latin box would ever follow.
 */
export const toLatin = (value: string): string | undefined =>
  isNameLatin(value) ? value : transliterate?.(value);

/**
 * The Latin name follows the local one only while nobody has written it
 * themselves — which is the case exactly while it still reads as the
 * transliteration of what the other box holds.
 */
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

/**
 * Whether the Latin box still reads as the transliteration of the local one —
 * undefined while the charmap has not arrived and nothing can be told yet.
 */
export const isFollowingLatin = (
  name: string,
  nameLocal: string
): boolean | undefined => {
  const followed = toLatin(nameLocal);

  return followed === undefined ? undefined : followed === name;
};
