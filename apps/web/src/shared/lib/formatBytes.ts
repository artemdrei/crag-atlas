const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * KILOBYTE;

export const formatBytes = (bytes: number, locale: string): string => {
  const isSmall = bytes < MEGABYTE;
  const value = bytes / (isSmall ? KILOBYTE : MEGABYTE);

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: isSmall ? 'kilobyte' : 'megabyte',
    unitDisplay: 'short',
    maximumFractionDigits: value < 10 ? 1 : 0
  }).format(value);
};

export const savedPercent = (before: number, after: number): number =>
  before > 0 ? Math.round(((before - after) / before) * 100) : 0;

export const signedPercent = (percent: number): string =>
  percent >= 0 ? `−${percent}%` : `+${-percent}%`;
