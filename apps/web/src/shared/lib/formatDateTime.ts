// A formatter costs far more to build than to use, and a list formats one date
// per row on every render.
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

export const formatDateTime = (iso: string, locale: string): string =>
  formatterFor(locale).format(new Date(iso));
