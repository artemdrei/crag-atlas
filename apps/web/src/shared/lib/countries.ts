const FIRST = 'A'.charCodeAt(0);
const LAST = 'Z'.charCodeAt(0);

// A country is catalog data, like a crag's name: one spelling everybody can
// read and type, not one that changes with the reader's interface language.
const LOCALE = 'en';

let cache: string[] | undefined;

const displayNames = new Intl.DisplayNames([LOCALE], {
  type: 'region',
  fallback: 'code'
});

export const countryName = (code: string): string =>
  displayNames.of(code) ?? code;

/**
 * ISO 3166-1 alpha-2 codes the runtime can name, sorted by that name. Read off
 * Intl rather than kept as a list of our own: a list would be one more thing to
 * keep current. Codes sharing a name are deprecated aliases (FX for FR) and
 * only the first survives.
 */
export const countryCodes = (): string[] => {
  if (cache) {
    return cache;
  }

  const byName = new Map<string, string>();

  for (let first = FIRST; first <= LAST; first += 1) {
    for (let second = FIRST; second <= LAST; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = displayNames.of(code);

      if (name && name !== code && !byName.has(name)) {
        byName.set(name, code);
      }
    }
  }

  cache = [...byName.entries()]
    .sort(([left], [right]) => left.localeCompare(right, LOCALE))
    .map(([, code]) => code);

  return cache;
};
