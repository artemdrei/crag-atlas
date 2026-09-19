import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  province!: string;

  @ApiProperty()
  rockType!: string;

  @ApiProperty()
  sectorCount!: number;

  @ApiProperty()
  routeCount!: number;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Derived from the routes of the region; null when it has none'
  })
  gradeRange?: string | null;
}

export class UpdateRegionDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  province!: string;

  @ApiProperty()
  rockType!: string;
}
