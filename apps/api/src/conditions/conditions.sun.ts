import {
  azimuthDifference,
  horizonAt,
  toDegrees,
  toRadians
} from '../horizon/horizon.geometry';

export interface SunPosition {
  altitude: number;
  azimuth: number;
}

export interface SunInterval {
  fromAt: string;
  untilAt: string;
}

export interface SunDay {
  sunriseAt: string | null;
  sunsetAt: string | null;
  intervals: SunInterval[];
  isSunByHour: boolean[];
}

export interface SunParams {
  lat: number;
  lng: number;
  date: string;
  utcOffsetSeconds: number;
  // Null where no profile has been computed; the flat horizon is then the
  // honest answer rather than a guess at the skyline.
  profile: number[] | null;
  aspectDeg: number | null;
}

// The sun's disc is half a degree wide and the atmosphere lifts it another
// third, so it is up before its centre geometrically is.
const SUNRISE_ALTITUDE = -0.833;

// A wall sees the half of the sky it faces. Right at the edge the light is
// grazing, which is why the limit is a right angle and not a hair more.
const WALL_FIELD_OF_VIEW = 90;

const STEP_MINUTES = 5;
const MINUTES_IN_DAY = 24 * 60;

// NOAA's solar position equations, which need nothing but the clock — no key,
// no request, and the same answer for a date ten years out as for today.
export const sunPosition = (
  lat: number,
  lng: number,
  at: Date
): SunPosition => {
  const julianDay = at.getTime() / 86_400_000 + 2_440_587.5;
  const century = (julianDay - 2_451_545) / 36_525;

  const meanLongitude =
    (280.46646 + century * (36_000.76983 + century * 0.0003032)) % 360;
  const meanAnomaly =
    357.52911 + century * (35_999.05029 - 0.0001537 * century);
  const eccentricity =
    0.016708634 - century * (0.000042037 + 0.0000001267 * century);

  const centre =
    Math.sin(toRadians(meanAnomaly)) *
      (1.914602 - century * (0.004817 + 0.000014 * century)) +
    Math.sin(toRadians(2 * meanAnomaly)) * (0.019993 - 0.000101 * century) +
    Math.sin(toRadians(3 * meanAnomaly)) * 0.000289;

  const node = 125.04 - 1934.136 * century;
  const apparentLongitude =
    meanLongitude + centre - 0.00569 - 0.00478 * Math.sin(toRadians(node));

  const meanObliquity =
    23 +
    (26 +
      (21.448 - century * (46.815 + century * (0.00059 - century * 0.001813))) /
        60) /
      60;
  const obliquity = meanObliquity + 0.00256 * Math.cos(toRadians(node));

  const declination = Math.asin(
    Math.sin(toRadians(obliquity)) * Math.sin(toRadians(apparentLongitude))
  );

  const variance = Math.tan(toRadians(obliquity) / 2) ** 2;
  const equationOfTime =
    4 *
    toDegrees(
      variance * Math.sin(2 * toRadians(meanLongitude)) -
        2 * eccentricity * Math.sin(toRadians(meanAnomaly)) +
        4 *
          eccentricity *
          variance *
          Math.sin(toRadians(meanAnomaly)) *
          Math.cos(2 * toRadians(meanLongitude)) -
        0.5 * variance ** 2 * Math.sin(4 * toRadians(meanLongitude)) -
        1.25 * eccentricity ** 2 * Math.sin(2 * toRadians(meanAnomaly))
    );

  const minutesUtc =
    at.getUTCHours() * 60 + at.getUTCMinutes() + at.getUTCSeconds() / 60;
  const solarMinutes = (minutesUtc + equationOfTime + 4 * lng + 1440) % 1440;
  const hourAngle = toRadians(solarMinutes / 4 - 180);

  const latRad = toRadians(lat);
  const cosZenith =
    Math.sin(latRad) * Math.sin(declination) +
    Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
  const zenith = Math.acos(Math.min(1, Math.max(-1, cosZenith)));

  const denominator = Math.cos(latRad) * Math.sin(zenith);
  let azimuth: number;

  if (Math.abs(denominator) > 0.000001) {
    const cosAzimuth =
      (Math.sin(latRad) * Math.cos(zenith) - Math.sin(declination)) /
      denominator;

    azimuth = 180 - toDegrees(Math.acos(Math.min(1, Math.max(-1, cosAzimuth))));

    if (solarMinutes / 4 - 180 > 0) azimuth = -azimuth;
  } else {
    azimuth = lat > 0 ? 180 : 0;
  }

  return { altitude: 90 - toDegrees(zenith), azimuth: (azimuth + 360) % 360 };
};

// Geometry only, deliberately: this says the sector is lit when no cloud is
// in the way, and the forecast says separately whether one is.
const isLit = (
  { altitude, azimuth }: SunPosition,
  { profile, aspectDeg }: Pick<SunParams, 'profile' | 'aspectDeg'>
): boolean => {
  // The same allowance either way, so a sector reads the same the moment
  // before its skyline is built and the moment after.
  if (altitude <= SUNRISE_ALTITUDE) return false;

  if (profile && altitude <= horizonAt(profile, azimuth)) return false;

  return (
    aspectDeg === null ||
    azimuthDifference(azimuth, aspectDeg) <= WALL_FIELD_OF_VIEW
  );
};

export const sunDay = ({
  lat,
  lng,
  date,
  utcOffsetSeconds,
  profile,
  aspectDeg
}: SunParams): SunDay => {
  // The wall clock at the crag is what the climber reads, so the day is
  // walked in local minutes and only turned into an instant to ask where the
  // sun is.
  const midnightUtcMs =
    Date.parse(`${date}T00:00:00Z`) - utcOffsetSeconds * 1000;

  // Both tests below ask about the same instants, and bisection asks about
  // them again, so the position is solved once per minute and kept.
  const positions = new Map<number, SunPosition>();

  const positionAt = (minute: number): SunPosition => {
    const known = positions.get(minute);

    if (known) return known;

    const position = sunPosition(
      lat,
      lng,
      new Date(midnightUtcMs + minute * 60_000)
    );
    positions.set(minute, position);

    return position;
  };

  const litAt = (minute: number) =>
    isLit(positionAt(minute), { profile, aspectDeg });

  const aboveHorizonAt = (minute: number) =>
    positionAt(minute).altitude > SUNRISE_ALTITUDE;

  const intervals: SunInterval[] = [];
  let openedAt: number | null = null;
  let wasLit = false;
  let sunriseAt: number | null = null;
  let sunsetAt: number | null = null;
  let wasUp = aboveHorizonAt(0);

  for (let minute = 0; minute <= MINUTES_IN_DAY; minute += STEP_MINUTES) {
    const isUp = aboveHorizonAt(minute);

    if (isUp !== wasUp) {
      const crossing = refine(minute - STEP_MINUTES, minute, aboveHorizonAt);

      if (isUp) sunriseAt = crossing;
      else sunsetAt = crossing;

      wasUp = isUp;
    }

    const lit = minute === MINUTES_IN_DAY ? false : litAt(minute);

    if (lit && !wasLit) openedAt = refine(minute - STEP_MINUTES, minute, litAt);

    if (!lit && wasLit && openedAt !== null) {
      intervals.push({
        fromAt: toClock(openedAt),
        untilAt: toClock(refine(minute - STEP_MINUTES, minute, litAt))
      });
      openedAt = null;
    }

    wasLit = lit;
  }

  return {
    sunriseAt: sunriseAt === null ? null : toClock(sunriseAt),
    sunsetAt: sunsetAt === null ? null : toClock(sunsetAt),
    intervals,
    isSunByHour: Array.from({ length: 24 }, (_, hour) => litAt(hour * 60))
  };
};

// Bisection between the last minute that was dark and the first that was
// light: five minute steps find the crossing, this names the minute.
const refine = (
  from: number,
  to: number,
  predicate: (minute: number) => boolean
): number => {
  let low = Math.max(0, from);
  let high = to;

  while (high - low > 1) {
    const middle = Math.round((low + high) / 2);

    if (predicate(middle) === predicate(high)) high = middle;
    else low = middle;
  }

  return high;
};

export const toClock = (minute: number): string => {
  const clamped = Math.min(MINUTES_IN_DAY - 1, Math.max(0, minute));
  const hour = Math.floor(clamped / 60);

  return `${String(hour).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
};
