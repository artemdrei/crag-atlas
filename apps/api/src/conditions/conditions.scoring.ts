import type { Shelter } from '../common/utils/shelter';
import type { ConditionBand, Step } from './conditions.config';
import { CONDITIONS_CONFIG } from './conditions.config';

export interface HourInput {
  temperatureC: number | null;
  humidityPct: number | null;
  windSpeedMs: number | null;
  precipitationMm: number | null;
  precipitation24hMm: number | null;
  weatherCode: number | null;
  hoursSinceRain: number | null;
  isSun: boolean;
}

export interface HourScore {
  score: number;
  band: ConditionBand;
  cappedBy: string | null;
}

const MS_TO_KMH = 3.6;

const step = (table: readonly Step[], value: number): number =>
  (table.find((row) => value < row.upTo) ?? table[table.length - 1])?.score ??
  0;

export const rainScore = (
  { precipitationMm, precipitation24hMm, hoursSinceRain }: HourInput,
  shelter: Shelter
): number => {
  const rule = CONDITIONS_CONFIG.shelter[shelter];
  const now = step(CONDITIONS_CONFIG.rainNow, precipitationMm ?? 0);
  const recent = step(
    CONDITIONS_CONFIG.rainRecency,
    hoursSinceRain ?? Number.POSITIVE_INFINITY
  );

  // The worse of the two: a dry hour does not dry the rock, and rock that
  // dried out days ago is still wet while it rains.
  const open = Math.min(now, recent);

  if (shelter === 'open') return open;

  const seepage = step(rule.seepage, precipitation24hMm ?? 0);

  return Math.min(Math.max(open, rule.rainFloor), seepage);
};

export const sunShadeScore = (
  temperatureC: number,
  isSun: boolean,
  shelter: Shelter
): number => {
  const row =
    CONDITIONS_CONFIG.sunShade.find((entry) => temperatureC < entry.upTo) ??
    CONDITIONS_CONFIG.sunShade[CONDITIONS_CONFIG.sunShade.length - 1];

  if (!row) return 100;

  return CONDITIONS_CONFIG.shelter[shelter].isAlwaysShadeScored || !isSun
    ? row.shade
    : row.sun;
};

export const weatherCodeScore = (code: number | null): number => {
  if (code === null) return CONDITIONS_CONFIG.weatherCode.fallback;

  const range = CONDITIONS_CONFIG.weatherCode.ranges.find(
    (entry) => code >= entry.from && code <= entry.to
  );

  return range?.score ?? CONDITIONS_CONFIG.weatherCode.fallback;
};

export const bandOf = (score: number): ConditionBand =>
  CONDITIONS_CONFIG.bands.find((entry) => score >= entry.from)?.band ?? 'bad';

const hardCap = (
  hour: HourInput,
  shelter: Shelter
): { maxScore: number; code: string } | null => {
  const obeysRainCap = CONDITIONS_CONFIG.shelter[shelter].obeysRainCap;
  const windKmh = (hour.windSpeedMs ?? 0) * MS_TO_KMH;

  const hit = CONDITIONS_CONFIG.hardCaps
    .filter((cap) => cap.precipitationMmAbove === undefined || obeysRainCap)
    .filter(
      (cap) =>
        (cap.precipitationMmAbove === undefined ||
          (hour.precipitationMm ?? 0) > cap.precipitationMmAbove) &&
        (cap.temperatureCBelow === undefined ||
          (hour.temperatureC ?? 0) < cap.temperatureCBelow) &&
        (cap.windKmhAbove === undefined || windKmh > cap.windKmhAbove) &&
        (cap.weatherCodes === undefined ||
          (hour.weatherCode !== null &&
            cap.weatherCodes.includes(hour.weatherCode)))
    )
    .sort((one, other) => one.maxScore - other.maxScore)[0];

  return hit ? { maxScore: hit.maxScore, code: hit.code } : null;
};

export const scoreHour = (hour: HourInput, shelter: Shelter): HourScore => {
  const temperatureC = hour.temperatureC ?? 15;
  const { weights } = CONDITIONS_CONFIG;

  const factors = {
    rain: rainScore(hour, shelter),
    temperature: step(CONDITIONS_CONFIG.temperature, temperatureC),
    humidity: step(CONDITIONS_CONFIG.humidity, hour.humidityPct ?? 60),
    sunShade: sunShadeScore(temperatureC, hour.isSun, shelter),
    wind: step(CONDITIONS_CONFIG.wind, (hour.windSpeedMs ?? 0) * MS_TO_KMH),
    other: weatherCodeScore(hour.weatherCode)
  };

  const weighted =
    factors.rain * weights.rain +
    factors.temperature * weights.temperature +
    factors.humidity * weights.humidity +
    factors.sunShade * weights.sunShade +
    factors.wind * weights.wind +
    factors.other * weights.other;

  const cap = hardCap(hour, shelter);
  const score = Math.round(Math.min(weighted, cap?.maxScore ?? 100));

  return { score, band: bandOf(score), cappedBy: cap?.code ?? null };
};

export interface Window {
  fromHour: number;
  untilHour: number;
  score: number;
}

// The run of hours a climber would actually pick: long enough to be a
// session, scored on its own average rather than on the single best hour.
export const bestWindow = (scoresByHour: (number | null)[]): Window | null => {
  const { minHours, maxHours, minHourScore } = CONDITIONS_CONFIG.bestWindow;
  let best: Window | null = null;

  for (let from = 0; from < scoresByHour.length; from += 1) {
    let total = 0;

    for (let length = 1; length <= maxHours; length += 1) {
      const score = scoresByHour[from + length - 1];

      if (score === null || score === undefined || score < minHourScore) break;

      total += score;

      if (length < minHours) continue;

      const average = total / length;
      const isBetter =
        !best ||
        average > best.score + 0.5 ||
        (average > best.score - 0.5 && length > best.untilHour - best.fromHour);

      if (isBetter) {
        best = {
          fromHour: from,
          untilHour: from + length,
          score: Math.round(average)
        };
      }
    }
  }

  return best;
};
