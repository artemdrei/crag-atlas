import { Injectable } from '@nestjs/common';

import { NotFoundException } from '../common/exceptions/app.exception';
import { readFailed } from '../common/exceptions/database.exception';
import type { Shelter } from '../common/utils/shelter';
import { publicSupabase } from '../config/supabase.client';
import { HorizonService } from '../horizon/horizon.service';
import { CONDITIONS_CONFIG } from './conditions.config';
import { assertForecast } from './conditions.forecast';
import type { HourInput } from './conditions.scoring';
import {
  bandOf,
  bestWindow,
  dayScore,
  dryingMm,
  scoreHour
} from './conditions.scoring';
import type { SunDay } from './conditions.sun';
import { sunDay, toClock } from './conditions.sun';
import type {
  ConditionsDayDto,
  ConditionsHourDto,
  ForecastDto,
  SectorConditionsDto
} from './conditions.types';

// Three weeks of chips. The forecast runs out partway through, and the days
// past it still carry sun and shade — that is computed from the calendar, not
// fetched.
const STRIP_DAYS = 21;

// Below this an hour counts as dry: the provider reports a trace of nothing
// as 0.0 and a drizzle as 0.1.
const RAIN_MM = 0.1;

// The series opens with the day before, which the rain history reaches into.
const WINDOW_PAST_HOURS = 24;

interface PointParams {
  lat: number;
  lng: number;
  shelter: Shelter;
  profile: number[] | null;
  aspectDeg: number | null;
}

interface SectorRow {
  lat: number | null;
  lng: number | null;
  shelter: Shelter;
  aspect_deg: number | null;
}

@Injectable()
export class ConditionsService {
  constructor(private readonly horizonService: HorizonService) {}

  async forSector(
    idSector: string,
    forecast: ForecastDto | null
  ): Promise<SectorConditionsDto> {
    const sector = await this.sector(idSector);
    const { lat, lng, shelter } = sector;

    if (lat == null || lng == null) {
      return {
        hasPoint: false,
        isHorizonReady: false,
        shelter,
        aspectDeg: sector.aspect_deg,
        days: []
      };
    }

    const window = forecast ? assertForecast(forecast) : null;
    const horizon = await this.horizonService.find(idSector);
    // Nothing is awaited: the card answers now with a flat horizon and the
    // skyline is there the next time the sector is opened.
    this.horizonService.buildWhenMissing(horizon, idSector);

    const profile = horizon?.computed_at ? horizon.profile : null;
    // An admin's answer beats the one read off the slope, and a sector with
    // neither is lit from every direction the skyline allows.
    const aspectDeg = sector.aspect_deg ?? horizon?.aspect_deg ?? null;

    return this.atPoint({ lat, lng, shelter, profile, aspectDeg }, window);
  }

  // A region is weather, not geometry: one crag's wall faces one way and the
  // next one faces another, so the card here answers "is it worth driving
  // out" and the sector's own card answers "which hours".
  async forRegion(
    idRegion: string,
    forecast: ForecastDto | null
  ): Promise<SectorConditionsDto> {
    const { data, error } = await publicSupabase()
      .from('regions')
      .select('lat, lng')
      .eq('id', idRegion)
      .is('deleted_at', null)
      .maybeSingle<{ lat: number | null; lng: number | null }>();

    if (error) {
      throw readFailed(
        'Could not load the region',
        'REGION_READ_FAILED',
        error
      );
    }

    if (!data) {
      throw new NotFoundException(
        `Region "${idRegion}" not found`,
        'REGION_NOT_FOUND'
      );
    }

    if (data.lat == null || data.lng == null) {
      return {
        hasPoint: false,
        isHorizonReady: false,
        shelter: 'open',
        aspectDeg: null,
        days: []
      };
    }

    return this.atPoint(
      {
        lat: data.lat,
        lng: data.lng,
        shelter: 'open',
        profile: null,
        aspectDeg: null
      },
      forecast ? assertForecast(forecast) : null
    );
  }

  private atPoint(
    { lat, lng, shelter, profile, aspectDeg }: PointParams,
    window: ForecastDto | null
  ): SectorConditionsDto {
    const offsetSeconds = window?.utcOffsetSeconds ?? localOffsetSeconds(lng);
    const today = firstForecastDate(window) ?? localDate(offsetSeconds);
    const series = window ? indexSeries(window) : null;

    const days = Array.from({ length: STRIP_DAYS }, (_, day) => {
      const date = shiftDate(today, day);

      return buildDay({
        date,
        sun: sunDay({
          lat,
          lng,
          date,
          utcOffsetSeconds: offsetSeconds,
          profile,
          aspectDeg
        }),
        series,
        shelter
      });
    });

    return {
      hasPoint: true,
      isHorizonReady: profile !== null,
      shelter,
      aspectDeg,
      days
    };
  }

  private async sector(idSector: string): Promise<SectorRow> {
    const { data, error } = await publicSupabase()
      .from('sectors')
      .select('lat, lng, shelter, aspect_deg')
      .eq('id', idSector)
      .is('deleted_at', null)
      .maybeSingle<SectorRow>();

    if (error) {
      throw readFailed(
        'Could not load the sector',
        'SECTOR_READ_FAILED',
        error
      );
    }

    if (!data) {
      throw new NotFoundException(
        `Sector "${idSector}" not found`,
        'SECTOR_NOT_FOUND'
      );
    }

    return data;
  }
}

interface DayParams {
  date: string;
  sun: SunDay;
  series: ForecastSeries | null;
  shelter: Shelter;
}

const buildDay = ({
  date,
  sun,
  series,
  shelter
}: DayParams): ConditionsDayDto => {
  const [dayStartHour, dayEndHour] = climbingHours(sun);
  const hours: ConditionsHourDto[] = [];
  const scoresByHour: (number | null)[] = Array.from(
    { length: 24 },
    () => null
  );

  for (let hour = dayStartHour; hour <= dayEndHour; hour += 1) {
    const at = toClock(hour * 60);
    const reading = series ? readingAt(series, `${date}T${at}`) : null;
    const isSun = sun.isSunByHour[hour] ?? false;

    const scored = reading ? scoreHour({ ...reading, isSun }, shelter) : null;

    if (scored) scoresByHour[hour] = scored.score;

    hours.push({
      at,
      isSun,
      score: scored?.score ?? null,
      band: scored?.band ?? null,
      temperatureC: reading?.temperatureC ?? null,
      precipitationMm: reading?.precipitationMm ?? null,
      humidityPct: reading?.humidityPct ?? null,
      windSpeedMs: reading?.windSpeedMs ?? null,
      weatherCode: reading?.weatherCode ?? null
    });
  }

  const score = dayScore(scoresByHour);
  const best = bestWindow(scoresByHour);

  return {
    date,
    hasForecast: score !== null,
    score,
    band: score === null ? null : bandOf(score),
    bestFromAt: best ? onTheHour(best.fromHour) : null,
    bestUntilAt: best ? onTheHour(best.untilHour) : null,
    sunriseAt: sun.sunriseAt,
    sunsetAt: sun.sunsetAt,
    sunIntervals: sun.intervals,
    hours
  };
};

// The end of the best window is exclusive and may land on the hour after the
// last scored one, which `toClock` would clamp back into the day.
const onTheHour = (hour: number): string =>
  `${String(hour).padStart(2, '0')}:00`;

// Daylight, trimmed to the hours anyone climbs. Without this the best
// window lands after sunset in October, where cool air and a shade score of
// a hundred beat every hour the sun was actually up.
const climbingHours = (sun: SunDay): [number, number] => {
  const { dayStartHour, dayEndHour } = CONDITIONS_CONFIG;

  if (!sun.sunriseAt || !sun.sunsetAt) return [dayStartHour, dayEndHour];

  return [
    Math.max(dayStartHour, Number(sun.sunriseAt.slice(0, 2))),
    Math.min(dayEndHour, Number(sun.sunsetAt.slice(0, 2)))
  ];
};

type Reading = Omit<HourInput, 'isSun'>;

interface ForecastSeries {
  window: ForecastDto;
  indexAt: Map<string, number>;
  wetness: number[];
  rain24h: number[];
}

// Every hour of the strip asks the same two questions of the hours behind it,
// so the whole series answers them once instead of walking backwards per hour.
// Wetness is read before the hour dries anything: the rock is still wet when
// the climber arrives at the start of it.
const indexSeries = (window: ForecastDto): ForecastSeries => {
  const indexAt = new Map<string, number>();
  const wetness: number[] = [];
  const rain24h: number[] = [];

  let wet = 0;
  let running = 0;

  window.time.forEach((at, index) => {
    indexAt.set(at, index);

    const fell = window.precipitationMm[index] ?? 0;

    running += fell;

    const leaving = window.precipitationMm[index - 24];

    if (leaving !== undefined) running -= leaving ?? 0;

    wet = Math.min(CONDITIONS_CONFIG.drying.surfaceMm, wet + fell);
    wetness.push(wet);
    rain24h.push(running);

    if (fell < RAIN_MM) {
      wet = Math.max(
        0,
        wet -
          dryingMm({
            temperatureC: window.temperatureC[index] ?? null,
            humidityPct: window.humidityPct[index] ?? null,
            windSpeedMs: window.windSpeedMs[index] ?? null
          })
      );
    }
  });

  return { window, indexAt, wetness, rain24h };
};

const readingAt = (series: ForecastSeries, at: string): Reading | null => {
  const index = series.indexAt.get(at);

  if (index === undefined) return null;

  const { window } = series;

  return {
    temperatureC: window.temperatureC[index] ?? null,
    humidityPct: window.humidityPct[index] ?? null,
    windSpeedMs: window.windSpeedMs[index] ?? null,
    precipitationMm: window.precipitationMm[index] ?? null,
    precipitation24hMm: series.rain24h[index] ?? 0,
    weatherCode: window.weatherCode[index] ?? null,
    wetnessMm: series.wetness[index] ?? 0
  };
};

const shiftDate = (date: string, days: number): string => {
  const value = new Date(`${date}T00:00:00Z`);

  value.setUTCDate(value.getUTCDate() + days);

  return value.toISOString().slice(0, 10);
};

// The provider's own first forecast day, which the hourly series is keyed
// on. Reading today off a clock instead would miss every lookup whenever the
// two disagree by an hour at the edge of a zone.
const firstForecastDate = (window: ForecastDto | null): string | null =>
  window?.time[WINDOW_PAST_HOURS]?.slice(0, 10) ?? null;

// Only reached without a forecast: today at the crag, which is
// not today on the server — a sector three zones east has turned the page.
const localDate = (offsetSeconds: number): string =>
  new Date(Date.now() + offsetSeconds * 1000).toISOString().slice(0, 10);

// An hour of longitude is fifteen degrees.
const localOffsetSeconds = (lng: number): number => Math.round(lng / 15) * 3600;
