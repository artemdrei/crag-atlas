import { ApiProperty } from '@nestjs/swagger';

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
    required: false,
    description: 'The climber corrected the numbers the provider answered with'
  })
  isManual?: boolean;
}

export class WeatherLookupDto {
  @ApiProperty({
    description:
      'False when the sector has no coordinates — nothing can be looked up and the conditions are written by hand'
  })
  hasPoint!: boolean;

  @ApiProperty({ type: TickWeatherDto, nullable: true })
  weather!: TickWeatherDto | null;
}

export class WeatherBackfillDto {
  @ApiProperty({ description: 'Ascents this call gave conditions to' })
  filled!: number;

  @ApiProperty({
    description: 'Ascents still waiting, because one call fills a batch at most'
  })
  remaining!: number;

  @ApiProperty({ description: 'Ascents the provider had no answer for' })
  failed!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Error code of the first ascent that failed'
  })
  failureCode!: string | null;
}
