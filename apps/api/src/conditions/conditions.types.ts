import { ApiProperty } from '@nestjs/swagger';

import type { Shelter } from '../common/utils/shelter';
import { SHELTERS } from '../common/utils/shelter';
import type { ConditionBand } from './conditions.config';
import { CONDITION_BANDS } from './conditions.config';

export class ConditionsHourDto {
  @ApiProperty({ description: 'Local wall clock at the crag, e.g. 14:00' })
  at!: string;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Null past the published forecast, where only the sun is known'
  })
  score!: number | null;

  @ApiProperty({
    enum: CONDITION_BANDS,
    nullable: true,
    description: 'The band the hour falls in, so a bar is coloured once'
  })
  band!: ConditionBand | null;

  @ApiProperty({
    description:
      'Direct sun reaches the sector, cloud aside — geometry, not forecast'
  })
  isSun!: boolean;

  @ApiProperty({ type: Number, nullable: true })
  temperatureC!: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'What the scoring took as fallen: the gauge, or the least a rain code can mean when the gauge rounds to nothing'
  })
  precipitationMm!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  humidityPct!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  windSpeedMs!: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'WMO weather code'
  })
  weatherCode!: number | null;
}

export class SunIntervalDto {
  @ApiProperty()
  fromAt!: string;

  @ApiProperty()
  untilAt!: string;
}

export class ConditionsDayDto {
  @ApiProperty({ description: 'Local date at the crag, YYYY-MM-DD' })
  date!: string;

  @ApiProperty({
    description: 'False past the published forecast; the sun is still known'
  })
  hasForecast!: boolean;

  @ApiProperty({ type: Number, nullable: true })
  score!: number | null;

  @ApiProperty({ enum: CONDITION_BANDS, nullable: true })
  band!: ConditionBand | null;

  @ApiProperty({ type: String, nullable: true })
  bestFromAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  bestUntilAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  sunriseAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  sunsetAt!: string | null;

  @ApiProperty({
    type: SunIntervalDto,
    isArray: true,
    description: 'When direct sun reaches the sector; empty on a wall in shade'
  })
  sunIntervals!: SunIntervalDto[];

  @ApiProperty({
    type: ConditionsHourDto,
    isArray: true,
    description: 'The climbing hours of the day, not the whole twenty-four'
  })
  hours!: ConditionsHourDto[];
}

export class SectorConditionsDto {
  @ApiProperty({
    description: 'False when the sector has no pin — nothing can be computed'
  })
  hasPoint!: boolean;

  @ApiProperty({
    description:
      'False while no skyline has been built; sun and shade then ignore the terrain'
  })
  isHorizonReady!: boolean;

  @ApiProperty({ enum: SHELTERS })
  shelter!: Shelter;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Direction the wall faces, 0 = north, clockwise'
  })
  aspectDeg!: number | null;

  @ApiProperty({ type: ConditionsDayDto, isArray: true })
  days!: ConditionsDayDto[];
}

const HOURLY_SERIES = {
  type: 'array',
  items: { type: 'number', nullable: true }
} as const;

export class ForecastDto {
  @ApiProperty({ description: 'Offset of the crag’s zone from UTC' })
  utcOffsetSeconds!: number;

  @ApiProperty({
    type: [String],
    description:
      'Local wall clock per hour, e.g. 2026-10-01T16:00, starting at midnight the day before today — the strip reads today from hour 24'
  })
  time!: string[];

  @ApiProperty(HOURLY_SERIES)
  temperatureC!: (number | null)[];

  @ApiProperty(HOURLY_SERIES)
  humidityPct!: (number | null)[];

  @ApiProperty(HOURLY_SERIES)
  precipitationMm!: (number | null)[];

  @ApiProperty({ ...HOURLY_SERIES, description: 'WMO weather code' })
  weatherCode!: (number | null)[];

  @ApiProperty(HOURLY_SERIES)
  windSpeedMs!: (number | null)[];
}

export class ConditionsRequestDto {
  @ApiProperty({
    type: ForecastDto,
    nullable: true,
    description:
      'Fetched by the browser; null when it could not be, and the strip then carries sun and shade alone'
  })
  forecast!: ForecastDto | null;
}
