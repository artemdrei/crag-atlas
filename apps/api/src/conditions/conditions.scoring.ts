import type { RockType } from '../common/utils/rockType';
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
  wetnessMm: number;
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

const ramp = (table: readonly Step[], value: number): number => {
  const first = table[0];
  const last = table[table.length - 1];

  if (!first || !last) return 0;
  if (value <= first.upTo) return first.score;
  if (value >= last.upTo) return last.score;

  const above = table.findIndex((row) => value < row.upTo);
  const from = table[above - 1];
  const to = table[above];

  if (!from || !to) return last.score;

  const share = (value - from.upTo) / (to.upTo - from.upTo);

  return from.score + (to.score - from.score) * share;
};

export const surfaceMm = (rockType: RockType): number =>
  CONDITIONS_CONFIG.drying.surfaceMm *
  CONDITIONS_CONFIG.rock[rockType].surfaceFactor;

export const dryingMm = (
  {
    temperatureC,
    humidityPct,
    windSpeedMs
  }: Pick<HourInput, 'temperatureC' | 'humidityPct' | 'windSpeedMs'>,
  rockType: RockType
): number => {
  const rule = CONDITIONS_CONFIG.drying;
  const windKmh = (windSpeedMs ?? 0) * MS_TO_KMH;

  return (
    rule.baseMmPerHour *
    CONDITIONS_CONFIG.rock[rockType].dryFactor *
    (windKmh > rule.windyKmhAbove ? rule.windyFactor : 1) *
    ((humidityPct ?? 60) > rule.humidPctAbove ? rule.humidFactor : 1) *
    ((temperatureC ?? 15) < rule.coldCBelow ? rule.coldFactor : 1)
  );
};

export const fallingMm = ({
  precipitationMm,
  weatherCode
}: Pick<HourInput, 'precipitationMm' | 'weatherCode'>): number => {
  const { ranges, atLeastMm } = CONDITIONS_CONFIG.rainCode;
  const saysRain =
    weatherCode !== null &&
    ranges.some(
      (range) => weatherCode >= range.from && weatherCode <= range.to
    );

  return Math.max(precipitationMm ?? 0, saysRain ? atLeastMm : 0);
};

export const rainScore = (hour: HourInput, shelter: Shelter): number => {
  const { precipitation24hMm, wetnessMm } = hour;
  const rule = CONDITIONS_CONFIG.shelter[shelter];
  const now = step(CONDITIONS_CONFIG.rainNow, fallingMm(hour));
  const wet = ramp(CONDITIONS_CONFIG.wetness, wetnessMm);

  const open = Math.min(now, wet);

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
          fallingMm(hour) > cap.precipitationMmAbove) &&
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

  const mean = Math.exp(
    (Object.keys(weights) as (keyof typeof weights)[]).reduce(
      (sum, key) => sum + weights[key] * Math.log(Math.max(factors[key], 1)),
      0
    )
  );

  const cap = hardCap(hour, shelter);
  const score = Math.round(Math.min(mean, cap?.maxScore ?? 100));

  return { score, band: bandOf(score), cappedBy: cap?.code ?? null };
};

export const dayScore = (
  scoresByHour: (number | null)[],
  rainHours = 0
): number | null => {
  const rule = CONDITIONS_CONFIG.day;
  const known = scoresByHour.filter((score): score is number => score !== null);

  if (known.length === 0) return null;

  const top = [...known]
    .sort((one, other) => other - one)
    .slice(0, rule.topHours);
  const session = top.reduce((total, one) => total + one, 0) / top.length;
  const coverage =
    known.filter((score) => score >= rule.coverageMinHourScore).length /
    known.length;
  const whole =
    session * (rule.coverageFloor + (1 - rule.coverageFloor) * coverage);
  const capped =
    rainHours >= rule.rainHoursFrom
      ? Math.min(whole, rule.rainyMaxScore)
      : whole;

  return Math.round(capped);
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
