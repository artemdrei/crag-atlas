// A formatter costs far more to build than to use, and a comment list formats
// one date per row on every render, so each locale builds its own once.
const formatters = new Map<string, Intl.DateTimeFormat>();

const formatterFor = (locale: string): Intl.DateTimeFormat => {
  const cached = formatters.get(locale);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short'
  });
  formatters.set(locale, formatter);

  return formatter;
};

/** An ISO timestamp as the reader's own date and clock, to the minute. */
export const formatDateTime = (iso: string, locale: string): string =>
  formatterFor(locale).format(new Date(iso));
