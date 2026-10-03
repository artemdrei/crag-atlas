// Intl rather than a table of our own: the strip is read in whatever locale
// the climber picked, and the names come with it.
export const weekdayLabel = (date: string, locale: string): string =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, {
    weekday: 'short'
  });

export const dayNumber = (date: string): number =>
  new Date(`${date}T12:00:00Z`).getUTCDate();
