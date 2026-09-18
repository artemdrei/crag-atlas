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

  @ApiProperty()
  gradeRange!: string;
}
