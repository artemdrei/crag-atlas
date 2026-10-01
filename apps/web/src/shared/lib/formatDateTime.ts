// A formatter costs far more to build than to use, and a list formats one date
// per row on every render.
const formatters = new Map<string, Intl.DateTimeFormat>();

const formatterFor = (
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => {
  const key = `${locale}|${options.dateStyle ?? ''}|${options.timeStyle ?? ''}`;
  const cached = formatters.get(key);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(locale, options);
  formatters.set(key, formatter);

  return formatter;
};

export const formatDateTime = (iso: string, locale: string): string =>
  formatterFor(locale, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );

/** A bare ISO date, read in the reader's locale and never shifted by a zone. */
export const formatDate = (iso: string, locale: string): string =>
  formatterFor(locale, { dateStyle: 'short' }).format(new Date(`${iso}T00:00`));
