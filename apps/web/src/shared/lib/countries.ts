const FIRST = 'A'.charCodeAt(0);
const LAST = 'Z'.charCodeAt(0);

const cache = new Map<string, string[]>();

const displayNames = (locale: string) =>
  new Intl.DisplayNames([locale], { type: 'region', fallback: 'code' });

export const countryName = (code: string, locale: string): string =>
  displayNames(locale).of(code) ?? code;

/**
 * ISO 3166-1 alpha-2 codes the runtime can name, sorted by that name. Read off
 * Intl rather than kept as a list of our own: a list would be one more thing to
 * translate and to keep current. Codes sharing a name are deprecated aliases
 * (FX for FR) and only the first survives.
 */
export const countryCodes = (locale: string): string[] => {
  const cached = cache.get(locale);

  if (cached) {
    return cached;
  }

  const names = displayNames(locale);
  const byName = new Map<string, string>();

  for (let first = FIRST; first <= LAST; first += 1) {
    for (let second = FIRST; second <= LAST; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = names.of(code);

      if (name && name !== code && !byName.has(name)) {
        byName.set(name, code);
      }
    }
  }

  const codes = [...byName.entries()]
    .sort(([left], [right]) => left.localeCompare(right, locale))
    .map(([, code]) => code);

  cache.set(locale, codes);

  return codes;
};
