import type { Coords } from '@web/shared/types';

const MAX_LAT = 90;
const MAX_LNG = 180;

const DMS =
  /(\d+(?:\.\d+)?)°\s*(\d+(?:\.\d+)?)['′]\s*(\d+(?:\.\d+)?)["″]?\s*([NSEW])/giu;
const DECIMAL_PAIR = /(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)/u;

const isInRange = ({ lat, lng }: Coords) =>
  Math.abs(lat) <= MAX_LAT && Math.abs(lng) <= MAX_LNG;

const fromDms = (input: string): Coords | undefined => {
  const parts = [...input.matchAll(DMS)].map((match) => ({
    hemisphere: (match[4] ?? '').toUpperCase(),
    value: Number(match[1]) + Number(match[2]) / 60 + Number(match[3]) / 3600
  }));

  const lat = parts.find(({ hemisphere }) => 'NS'.includes(hemisphere));
  const lng = parts.find(({ hemisphere }) => 'EW'.includes(hemisphere));

  if (!lat || !lng) return undefined;

  return {
    lat: lat.hemisphere === 'S' ? -lat.value : lat.value,
    lng: lng.hemisphere === 'W' ? -lng.value : lng.value
  };
};

const fromDecimal = (input: string): Coords | undefined => {
  const match = input.match(DECIMAL_PAIR);

  if (!match?.[1] || !match[2]) return undefined;

  return { lat: Number(match[1]), lng: Number(match[2]) };
};

export const parseCoords = (input: string): Coords | undefined => {
  const coords = fromDms(input) ?? fromDecimal(input);

  return coords && isInRange(coords) ? coords : undefined;
};
