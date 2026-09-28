/**
 * The local spelling worth printing beside a Latin name. A transliteration
 * that came out identical says the same thing twice, so it is dropped.
 */
export const localNameOf = (
  name: string,
  nameLocal?: string | null
): string | null => (nameLocal && nameLocal !== name ? nameLocal : null);
