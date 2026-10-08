import { ApiProperty } from '@nestjs/swagger';

// Extend together with the check on `tick_weather.source` when a provider is
// added; readings already saved keep naming the one they came from.
export const WEATHER_SOURCES = ['open-meteo'] as const;

export type WeatherSource = (typeof WEATHER_SOURCES)[number];

export class TickWeatherDto {
  @ApiProperty({
    description:
      'Local wall clock at the crag, e.g. 2026-10-01T16:00. Taken from the ascent when one is saved, so a sent value is ignored'
  })
  observedAt!: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  lat?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  lng?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  temperatureC?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  apparentTemperatureC?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  dewPointC?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  humidityPct?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  windSpeedMs?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  windGustMs?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  precipitationMm?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'What fell in the 24 hours up to observedAt'
  })
  precipitation24hMm?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  cloudCoverPct?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'WMO weather code'
  })
  weatherCode?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  sunrise?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  sunset?: string | null;

  @ApiProperty({
    enum: WEATHER_SOURCES,
    required: false,
    nullable: true,
    description:
      'The provider the reading came from; null when it was written by hand'
  })
  source?: WeatherSource | null;

  @ApiProperty({
    required: false,
    description: 'The climber corrected the numbers the provider answered with'
  })
  isManual?: boolean;
}
